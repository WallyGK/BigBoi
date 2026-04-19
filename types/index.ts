// types/index.ts
export interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
  description?: string;
  sticky_note?: string;
  is_deleted?: boolean;
}

export type NewExercise = Omit<Exercise, "id">;

export interface Template {
  id: string;
  name: string;
  exercises?: string[];
  description?: string;
  is_deleted?: boolean;
}

export type NewTemplate = Omit<Template, "id">;

export interface TemplateSetDetail {
  setOrder: number;
  reps: number;
  weight: number;
  notes?: string;
}

export interface TemplateSetEntryInput {
  reps: number;
  weight: number;
  notes?: string;
}

export interface TemplateExercise extends Exercise {
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
  setDetails?: TemplateSetDetail[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number;
    notes?: string;
  }[];
  is_deleted?: boolean;
}

export interface WorkoutExerciseEntry {
  id: string;
  workout_id: string;
  exercise_id: string;
  reps: number;
  weight: number;
  notes?: string;
  datetime: string;
  exercise_name: string;
  muscle_group?: string;
  duration_seconds?: number | null;
}

export interface WorkoutLogSummary {
  id: string;
  datetime: string;
  exercise_count: number;
  total_weight: number;
  duration_seconds?: number | null;
  notes_preview?: string | null;
}

export interface WorkoutExerciseDetail {
  id: string;
  workout_id: string;
  datetime: string;
  duration_seconds?: number | null;
  exercise_id: string;
  exercise_name: string;
  reps: number;
  weight: number;
  notes?: string;
  execution_order: number;
}

export interface WorkoutLogRow {
  id: string;
  datetime: string;
  is_deleted?: boolean;
}

export interface WorkoutExerciseRow {
  id: string;
  workout_id: string;
  exercise_id: string;
  reps: number;
  weight: number;
  notes?: string;
}
