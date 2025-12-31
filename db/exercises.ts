// db/exercises.ts
import { Exercise, NewExercise } from "@/types";
import uuid from "react-native-uuid";
import { getDb } from "./index";

// CREATE: Add a new exercise
export async function addExercise(
  exercise: NewExercise
): Promise<Exercise | null> {
  const db = await getDb();
  try {
    const exerciseId = uuid.v4().toString();

    await db.runAsync(
      `INSERT INTO exercises (
                id,
                name,
                muscleGroup,
                description
            ) VALUES (?, ?, ?, ?);`,
      [
        exerciseId,
        exercise.name,
        exercise.muscleGroup || "",
        exercise.description || "",
      ]
    );

    const newExercise = await db.getFirstAsync<Exercise>(
      `SELECT * FROM exercises WHERE id = ?`,
      [exerciseId]
    );

    return newExercise;
  } catch (error) {
    console.error("Error adding exercise:", error);
    throw error;
  }
}

// READ: Get all exercises matching a search query
export async function searchExercisesAsync(
  searchQuery: string
): Promise<Exercise[]> {
  const db = await getDb();
  try {
    const query = `
      SELECT id, name, muscleGroup, description FROM exercises 
      WHERE is_deleted = 0
      AND (name LIKE ? OR muscleGroup LIKE ?)
      ORDER BY name ASC
    `;
    const searchPattern = `%${searchQuery}%`;
    return await db.getAllAsync<Exercise>(query, [
      searchPattern,
      searchPattern,
    ]);
  } catch (error) {
    console.error("Error searching exercises:", error);
    return [];
  }
}

// READ: Get exercise by ID
export async function getExerciseById(id: string): Promise<Exercise | null> {
  const db = await getDb();
  try {
    return await db.getFirstAsync<Exercise>(
      `SELECT id, name, muscleGroup, description FROM exercises WHERE id = ? AND is_deleted = 0`,
      [id]
    );
  } catch (error) {
    console.error("Error getting exercise:", error);
    return null;
  }
}

// UPDATE: Update exercise info
export async function updateExerciseAsync(exercise: Exercise): Promise<void> {
  const db = await getDb();

  await db.runAsync(
    `
    UPDATE exercises
    SET
      name = ?,
      muscleGroup = ?,
      description = ?
    WHERE id = ?;
    `,
    [
      exercise.name,
      exercise.muscleGroup ?? "",
      exercise.description ?? "",
      exercise.id,
    ]
  );
}

// DELETE: Soft delete
export async function deleteExerciseAsync(id: string): Promise<void> {
  const db = await getDb();
  try {
    await db.runAsync("UPDATE exercises SET is_deleted = 1 WHERE id = ?;", [
      id,
    ]);
    console.log(`Exercise ${id} marked as deleted`);
  } catch (error) {
    console.error("Error deleting exercise:", error);
    throw error;
  }
}
