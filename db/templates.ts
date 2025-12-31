// db/templates.ts
import { NewTemplate, Template, TemplateExercise } from "@/types";
import uuid from "react-native-uuid";
import { getDb } from "./index";

// CREATE: Add a new template
export async function addTemplate(
  template: NewTemplate
): Promise<Template | null> {
  const db = await getDb();
  try {
    const templateId = uuid.v4().toString();

    await db.runAsync(
      `INSERT INTO templates (
                id,
                name,
                description
            ) VALUES (?, ?, ?);`,
      [templateId, template.name, template.description || ""]
    );

    const newTemplate = await db.getFirstAsync<Template>(
      `SELECT * FROM templates WHERE id = ?`,
      [templateId]
    );

    return newTemplate;
  } catch (error) {
    console.error("Error adding template:", error);
    throw error;
  }
}

// READ: Get all templates matching a search query
export async function searchTemplatesAsync(
  searchQuery: string
): Promise<Template[]> {
  const db = await getDb();
  try {
    const query = `
      SELECT * FROM templates 
      WHERE is_deleted = 0
      AND (name LIKE ?)
      ORDER BY name ASC
    `;
    const searchPattern = `%${searchQuery}%`;
    return await db.getAllAsync<Template>(query, [
      searchPattern,
      searchPattern,
    ]);
  } catch (error) {
    console.error("Error searching templates:", error);
    return [];
  }
}

// READ: Get template by ID
export async function getTemplateById(id: string): Promise<Template | null> {
  const db = await getDb();
  try {
    return await db.getFirstAsync<Template>(
      `SELECT * FROM templates WHERE id = ? AND is_deleted = 0`,
      [id]
    );
  } catch (error) {
    console.error("Error getting template:", error);
    return null;
  }
}

// UPDATE: Update template info
export async function updateTemplateAsync(template: Template): Promise<void> {
  const db = await getDb();

  await db.runAsync(
    `
    UPDATE templates
    SET
      name = ?,
      description = ?
    WHERE id = ?;
    `,
    [template.name, template.description || "", template.id]
  );
}

// DELETE: Soft delete
export async function deleteTemplateAsync(id: string): Promise<void> {
  const db = await getDb();
  try {
    await db.runAsync("UPDATE templates SET is_deleted = 1 WHERE id = ?;", [
      id,
    ]);
    console.log(`Template ${id} marked as deleted`);
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
}

export async function addExerciseToTemplate(
  templateId: string,
  exerciseId: string,
  sets: number = 0,
  reps: number = 0,
  weight: number = 0,
  notes: string = ""
) {
  const db = await getDb();
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO template_exercises (template_id, exercise_id, sets, reps, weight, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [templateId, exerciseId, sets, reps, weight, notes]
    );
  } catch (error) {
    console.error("Error adding exercise to template:", error);
    throw error;
  }
}

export async function removeExerciseFromTemplate(
  templateId: string,
  exerciseId: string
) {
  const db = await getDb();
  try {
    await db.runAsync(
      `DELETE FROM template_exercises WHERE template_id = ? AND exercise_id = ?`,
      [templateId, exerciseId]
    );
  } catch (error) {
    console.error("Error removing exercise from template:", error);
    throw error;
  }
}

export async function getExercisesForTemplate(
  templateId: string
): Promise<TemplateExercise[]> {
  const db = await getDb();
  return await db.getAllAsync<TemplateExercise>(
    `SELECT e.*, te.sets, te.reps, te.weight, te.notes
     FROM exercises e
     INNER JOIN template_exercises te ON e.id = te.exercise_id
     WHERE te.template_id = ? AND e.is_deleted = 0`,
    [templateId]
  );
}

export async function updateTemplateExercise(
  templateId: string,
  exerciseId: string,
  sets: number,
  reps: number,
  notes: string
) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE template_exercises
     SET sets = ?, reps = ?, notes = ?
     WHERE template_id = ? AND exercise_id = ?`,
    [sets, reps, notes, templateId, exerciseId]
  );
}
