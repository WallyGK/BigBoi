// types/index.ts
export interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
}

export interface Template {
  id: string;
  name: string;
  exercises: string[];
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
}
