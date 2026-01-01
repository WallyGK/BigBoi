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
  }[]
) {
  const db = await getDb();
  const workoutId = uuid.v4().toString();
  await db.runAsync(
    `INSERT INTO workout_logs (id, datetime, is_deleted) VALUES (?, ?, 0)`,
    [workoutId, datetime]
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
      ]
    );
  }
  return workoutId;
}

// Get all workout logs (optionally filter by datetime)
export async function getWorkoutLogs(datetime?: string) {
  const db = await getDb();
  let query = `SELECT * FROM workout_logs WHERE is_deleted = 0`;
  const params: any[] = [];
  if (datetime) {
    query += ` AND datetime = ?`;
    params.push(datetime);
  }
  return db.getAllAsync(query, params);
}

// Get all exercises for a workout log
export async function getWorkoutExercises(workoutId: string) {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT * FROM workout_exercises WHERE workout_id = ?`,
    [workoutId]
  );
}

// Soft delete a workout log
export async function deleteWorkoutLog(workoutId: string) {
  const db = await getDb();
  await db.runAsync(`UPDATE workout_logs SET is_deleted = 1 WHERE id = ?`, [
    workoutId,
  ]);
}
