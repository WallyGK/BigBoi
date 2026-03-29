import {
  type WorkoutExerciseDetail,
  type WorkoutExerciseEntry,
  type WorkoutExerciseRow,
  type WorkoutLogRow,
  type WorkoutLogSummary,
} from "@/types";
import uuid from "react-native-uuid";
import { getDb } from "./index";

// Add a new workout log and its exercises
export async function addWorkoutLog(
  datetime: string,
  exercises: {
    exercise_id: string;
    reps: number;
    weight: number;
    notes?: string;
  }[],
): Promise<string> {
  const db = await getDb();
  const workoutId = uuid.v4().toString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO workout_logs (id, datetime, is_deleted) VALUES (?, ?, 0)`,
      [workoutId, datetime],
    );

    for (const ex of exercises) {
      const exerciseRowId = uuid.v4().toString();
      await db.runAsync(
        `INSERT INTO workout_exercises (id, workout_id, exercise_id, reps, weight, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          exerciseRowId,
          workoutId,
          ex.exercise_id,
          ex.reps,
          ex.weight,
          ex.notes || "",
        ],
      );
    }
  });

  return workoutId;
}

// Get all workout logs (optionally filter by datetime)
export async function getWorkoutLogs(
  datetime?: string,
): Promise<WorkoutLogRow[]> {
  const db = await getDb();
  let query = `SELECT id, datetime, is_deleted FROM workout_logs WHERE is_deleted = 0`;
  const params: string[] = [];
  if (datetime) {
    query += ` AND datetime = ?`;
    params.push(datetime);
  }
  return db.getAllAsync<WorkoutLogRow>(query, params);
}

export async function getWorkoutLogSummaries(): Promise<WorkoutLogSummary[]> {
  const db = await getDb();
  return db.getAllAsync<WorkoutLogSummary>(
    `
      SELECT
        wl.id,
        wl.datetime,
        COUNT(we.id) AS exercise_count,
        COALESCE(SUM(we.reps * we.weight), 0) AS total_weight
      FROM workout_logs wl
      LEFT JOIN workout_exercises we ON we.workout_id = wl.id
      WHERE wl.is_deleted = 0
      GROUP BY wl.id, wl.datetime
      ORDER BY wl.datetime DESC
    `,
  );
}

// Get all exercises for a workout log
export async function getWorkoutExercises(
  workoutId: string,
): Promise<WorkoutExerciseRow[]> {
  const db = await getDb();
  return db.getAllAsync<WorkoutExerciseRow>(
    `SELECT id, workout_id, exercise_id, reps, weight, notes FROM workout_exercises WHERE workout_id = ?`,
    [workoutId],
  );
}

export async function getWorkoutExercisesWithNames(
  workoutId: string,
): Promise<WorkoutExerciseDetail[]> {
  const db = await getDb();
  return db.getAllAsync<WorkoutExerciseDetail>(
    `
      SELECT
        we.id,
        we.workout_id,
        we.rowid AS execution_order,
        wl.datetime,
        we.exercise_id,
        ex.name AS exercise_name,
        we.reps,
        we.weight,
        we.notes
      FROM workout_exercises we
      INNER JOIN workout_logs wl ON wl.id = we.workout_id
      INNER JOIN exercises ex ON ex.id = we.exercise_id
      WHERE we.workout_id = ?
      ORDER BY we.rowid ASC
    `,
    [workoutId],
  );
}

// Soft delete a workout log
export async function deleteWorkoutLog(workoutId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE workout_logs SET is_deleted = 1 WHERE id = ?`, [
    workoutId,
  ]);
}

// Get all workout exercises with workout log and exercise details, optionally filter by exercise name
export async function getWorkoutExerciseEntries(
  exerciseName?: string,
): Promise<WorkoutExerciseEntry[]> {
  const db = await getDb();
  let query = `
    SELECT wl.datetime, we.*, ex.name as exercise_name
    FROM workout_exercises we
    JOIN workout_logs wl ON we.workout_id = wl.id
    JOIN exercises ex ON we.exercise_id = ex.id
    WHERE wl.is_deleted = 0
  `;
  const params: string[] = [];
  if (exerciseName) {
    query += ` AND ex.name LIKE ?`;
    params.push(`%${exerciseName}%`);
  }
  query += ` ORDER BY wl.datetime DESC`;
  return db.getAllAsync<WorkoutExerciseEntry>(query, params);
}
