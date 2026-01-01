import { type SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1; // start with 1, increment as you add migrations

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
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

  // Future migrations go here, e.g., version 2, 3, etc.
  // if (currentDbVersion === 1) { ... }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  console.log(`Database migrated to version ${DATABASE_VERSION}`);
}
