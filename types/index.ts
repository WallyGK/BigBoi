// types/index.ts
export interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
  is_deleted?: boolean;
}

export type NewExercise = Omit<Exercise, "id">;

export interface Template {
  id: string;
  name: string;
  exercises: string[];
  is_deleted?: boolean;
}

export type NewTemplate = Omit<Template, "id">;

export interface TemplateExercise extends Exercise {
  sets?: number;
  reps?: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
  is_deleted?: boolean;
}
