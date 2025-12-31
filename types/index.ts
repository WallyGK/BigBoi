// types/index.ts
export interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
  description?: string;
  is_deleted?: boolean;
}

export type NewExercise = Omit<Exercise, "id">;

export interface Template {
  id: string;
  name: string;
  exercises: string[];
  description?: string;
  is_deleted?: boolean;
}

export type NewTemplate = Omit<Template, "id">;

export interface TemplateExercise extends Exercise {
  sets?: number;
  reps?: number;
  notes?: string;
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
