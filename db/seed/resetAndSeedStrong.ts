import { getDb } from "@/db/index";
import { strongSeedWorkouts } from "@/db/seed/strongSeed";
import uuid from "react-native-uuid";

export interface ResetSeedResult {
  workoutsImported: number;
  setsImported: number;
  exercisesImported: number;
}

export async function resetAndSeedStrongData(): Promise<ResetSeedResult> {
  const db = await getDb();

  const exerciseIdByName = new Map<string, string>();
  let setsImported = 0;

  await db.withTransactionAsync(async () => {
    // Clear all user data tables before importing seed data.
    await db.execAsync(`
      DELETE FROM template_exercises;
      DELETE FROM workout_exercises;
      DELETE FROM workout_logs;
      DELETE FROM templates;
      DELETE FROM exercises;
    `);

    for (const workout of strongSeedWorkouts) {
      const workoutId = uuid.v4().toString();

      await db.runAsync(
        `INSERT INTO workout_logs (id, datetime, is_deleted) VALUES (?, ?, 0)`,
        [workoutId, workout.datetime],
      );

      for (const set of workout.sets) {
        let exerciseId = exerciseIdByName.get(set.exerciseName);

        if (!exerciseId) {
          exerciseId = uuid.v4().toString();
          exerciseIdByName.set(set.exerciseName, exerciseId);

          await db.runAsync(
            `INSERT INTO exercises (id, name, muscleGroup, description, is_deleted) VALUES (?, ?, '', '', 0)`,
            [exerciseId, set.exerciseName],
          );
        }

        await db.runAsync(
          `INSERT INTO workout_exercises (id, workout_id, exercise_id, reps, weight, notes) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            uuid.v4().toString(),
            workoutId,
            exerciseId,
            set.reps,
            set.weight,
            set.notes ?? "",
          ],
        );

        setsImported += 1;
      }
    }
  });

  return {
    workoutsImported: strongSeedWorkouts.length,
    setsImported,
    exercisesImported: exerciseIdByName.size,
  };
}
