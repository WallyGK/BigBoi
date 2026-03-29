// db/templates.ts
import {
  NewTemplate,
  Template,
  TemplateExercise,
  TemplateSetDetail,
} from "@/types";
import uuid from "react-native-uuid";
import { getDb } from "./index";

interface TemplateExerciseRow {
  id: string;
  name: string;
  muscleGroup?: string;
  description?: string;
  is_deleted?: boolean;
  set_order: number;
  reps: number;
  weight: number;
  notes?: string;
}

// CREATE: Add a new template
export async function addTemplate(
  template: NewTemplate,
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
      [templateId, template.name, template.description || ""],
    );

    const newTemplate = await db.getFirstAsync<Template>(
      `SELECT * FROM templates WHERE id = ?`,
      [templateId],
    );

    return newTemplate;
  } catch (error) {
    console.error("Error adding template:", error);
    throw error;
  }
}

// READ: Get all templates matching a search query
export async function searchTemplatesAsync(
  searchQuery: string,
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
    return await db.getAllAsync<Template>(query, [searchPattern]);
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
      [id],
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
    [template.name, template.description || "", template.id],
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
  notes: string = "",
  setEntries?: Omit<TemplateSetDetail, "setOrder">[],
) {
  const db = await getDb();
  try {
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `DELETE FROM template_exercises WHERE template_id = ? AND exercise_id = ?`,
        [templateId, exerciseId],
      );

      const normalizedEntries =
        setEntries && setEntries.length > 0
          ? setEntries
          : Array.from({ length: Math.max(1, Number(sets) || 1) }, () => ({
              reps: Number(reps) || 0,
              weight: Number(weight) || 0,
              notes,
            }));

      for (let i = 0; i < normalizedEntries.length; i += 1) {
        const entry = normalizedEntries[i];
        await db.runAsync(
          `INSERT INTO template_exercises (template_id, exercise_id, set_order, reps, weight, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            templateId,
            exerciseId,
            i + 1,
            Number(entry.reps) || 0,
            Number(entry.weight) || 0,
            entry.notes || "",
          ],
        );
      }
    });
  } catch (error) {
    console.error("Error adding exercise to template:", error);
    throw error;
  }
}

export async function removeExerciseFromTemplate(
  templateId: string,
  exerciseId: string,
) {
  const db = await getDb();
  try {
    await db.runAsync(
      `DELETE FROM template_exercises WHERE template_id = ? AND exercise_id = ?`,
      [templateId, exerciseId],
    );
  } catch (error) {
    console.error("Error removing exercise from template:", error);
    throw error;
  }
}

export async function getExercisesForTemplate(
  templateId: string,
): Promise<TemplateExercise[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TemplateExerciseRow>(
    `SELECT
        e.*, te.set_order, te.reps, te.weight, te.notes
     FROM exercises e
     INNER JOIN template_exercises te ON e.id = te.exercise_id
     WHERE te.template_id = ? AND e.is_deleted = 0
     ORDER BY te.exercise_id ASC, te.set_order ASC`,
    [templateId],
  );

  const grouped = new Map<string, TemplateExercise>();

  for (const row of rows) {
    const existing = grouped.get(row.id);
    if (!existing) {
      grouped.set(row.id, {
        id: row.id,
        name: row.name,
        muscleGroup: row.muscleGroup,
        description: row.description,
        is_deleted: row.is_deleted,
        sets: 1,
        reps: row.reps,
        weight: row.weight,
        notes: row.notes || "",
        setDetails: [
          {
            setOrder: row.set_order,
            reps: row.reps,
            weight: row.weight,
            notes: row.notes || "",
          },
        ],
      });
      continue;
    }

    existing.sets = (existing.sets || 0) + 1;
    if (!existing.setDetails) {
      existing.setDetails = [];
    }
    existing.setDetails.push({
      setOrder: row.set_order,
      reps: row.reps,
      weight: row.weight,
      notes: row.notes || "",
    });
  }

  return Array.from(grouped.values());
}

export async function updateTemplateExercise(
  templateId: string,
  exerciseId: string,
  sets: number,
  reps: number,
  notes: string,
) {
  const db = await getDb();
  await addExerciseToTemplate(
    templateId,
    exerciseId,
    sets,
    reps,
    0,
    notes,
    Array.from({ length: Math.max(1, Number(sets) || 1) }, () => ({
      reps,
      weight: 0,
      notes,
    })),
  );
}
