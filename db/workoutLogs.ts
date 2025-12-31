import uuid from "react-native-uuid";
import { getDb } from "./index";

// Add a new workout log and its exercises
export async function addWorkoutLog(
  date: string,
  exercises: {
    exercise_id: string;
    sets: number;
    reps: number;
    weight: number;
    notes?: string;
  }[]
) {
  const db = await getDb();
  const workoutId = uuid.v4().toString();
  await db.runAsync(
    `INSERT INTO workout_logs (id, date, is_deleted) VALUES (?, ?, 0)`,
    [workoutId, date]
  );
  for (const ex of exercises) {
    await db.runAsync(
      `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [workoutId, ex.exercise_id, ex.sets, ex.reps, ex.weight, ex.notes || ""]
    );
  }
  return workoutId;
}

// Get all workout logs (optionally filter by date)
export async function getWorkoutLogs(date?: string) {
  const db = await getDb();
  let query = `SELECT * FROM workout_logs WHERE is_deleted = 0`;
  const params: any[] = [];
  if (date) {
    query += ` AND date = ?`;
    params.push(date);
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
