import { type SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 4; // start with 1, increment as you add migrations

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  let currentDbVersion = result?.user_version ?? 0;
  console.log("Current DB version:", currentDbVersion);
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  // Initial database setup
  if (currentDbVersion === 0) {
    console.log("Migrating to version 1");

    // Exercises table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        muscleGroup TEXT DEFAULT '',
        description TEXT DEFAULT '',
        is_deleted BOOLEAN DEFAULT 0
      );
    `);

    // Templates table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        is_deleted BOOLEAN DEFAULT 0
      );
    `);

    // Template -> Exercises mapping table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS template_exercises (
        template_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        sets INTEGER NOT NULL DEFAULT 0,
        reps INTEGER NOT NULL DEFAULT 0,
        weight REAL NOT NULL DEFAULT 0,
        notes TEXT DEFAULT '',
        PRIMARY KEY (template_id, exercise_id),
        FOREIGN KEY (template_id) REFERENCES templates(id),
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
      );
    `);

    // Workout logs table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_logs (
        id TEXT PRIMARY KEY,
        datetime TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT 0
      );
    `);

    // Workout -> Exercises mapping table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id TEXT PRIMARY KEY,
        workout_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        reps INTEGER NOT NULL DEFAULT 0,
        weight REAL NOT NULL DEFAULT 0,
        notes TEXT DEFAULT '',
        FOREIGN KEY (workout_id) REFERENCES workout_logs(id),
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
      );
    `);

    currentDbVersion = 1;
  }

  // Migrate template_exercises to one row per set.
  if (currentDbVersion === 1) {
    console.log("Migrating to version 2");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS template_exercises_v2 (
        template_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        set_order INTEGER NOT NULL,
        reps INTEGER NOT NULL DEFAULT 0,
        weight REAL NOT NULL DEFAULT 0,
        notes TEXT DEFAULT '',
        PRIMARY KEY (template_id, exercise_id, set_order),
        FOREIGN KEY (template_id) REFERENCES templates(id),
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
      );
    `);

    const legacyRows = await db.getAllAsync<{
      template_id: string;
      exercise_id: string;
      sets: number;
      reps: number;
      weight: number;
      notes?: string;
    }>(
      `SELECT template_id, exercise_id, sets, reps, weight, notes FROM template_exercises`,
    );

    for (const row of legacyRows) {
      const totalSets = Math.max(1, Number(row.sets) || 1);
      for (let setOrder = 1; setOrder <= totalSets; setOrder += 1) {
        await db.runAsync(
          `INSERT INTO template_exercises_v2 (template_id, exercise_id, set_order, reps, weight, notes)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [
            row.template_id,
            row.exercise_id,
            setOrder,
            Number(row.reps) || 0,
            Number(row.weight) || 0,
            row.notes || "",
          ],
        );
      }
    }

    await db.execAsync(`
      DROP TABLE template_exercises;
      ALTER TABLE template_exercises_v2 RENAME TO template_exercises;
      CREATE INDEX IF NOT EXISTS idx_template_exercises_template_id ON template_exercises(template_id);
      CREATE INDEX IF NOT EXISTS idx_template_exercises_exercise_id ON template_exercises(exercise_id);
    `);

    currentDbVersion = 2;
  }

  // Add sticky_note column to exercises
  if (currentDbVersion === 2) {
    console.log("Migrating to version 3");
    await db.execAsync(
      `ALTER TABLE exercises ADD COLUMN sticky_note TEXT DEFAULT '';`,
    );
    currentDbVersion = 3;
  }

  // Add duration_seconds column to workout_logs
  if (currentDbVersion === 3) {
    console.log("Migrating to version 4");
    await db.execAsync(
      `ALTER TABLE workout_logs ADD COLUMN duration_seconds INTEGER DEFAULT NULL;`,
    );
    currentDbVersion = 4;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  console.log(`Database migrated to version ${DATABASE_VERSION}`);
}
