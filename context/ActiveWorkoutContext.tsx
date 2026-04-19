import { Exercise } from "@/types";
import React, { createContext, useContext, useState } from "react";

export type WorkoutSetInput = {
  reps: string;
  weight: string;
  notes: string;
  done: boolean;
};

export type WorkoutSection = {
  exercise: Exercise;
  sets: WorkoutSetInput[];
};

interface ActiveWorkoutContextValue {
  sections: WorkoutSection[];
  setSections: React.Dispatch<React.SetStateAction<WorkoutSection[]>>;
  mode: string;
  setMode: (mode: string) => void;
  workoutTitle: string;
  setWorkoutTitle: (title: string) => void;
  startedAt: Date | null;
  setStartedAt: (date: Date | null) => void;
  clearWorkout: () => void;
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextValue | null>(
  null,
);

export function ActiveWorkoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sections, setSections] = useState<WorkoutSection[]>([]);
  const [mode, setMode] = useState("free");
  const [workoutTitle, setWorkoutTitle] = useState("Workout");
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  const clearWorkout = () => {
    setSections([]);
    setMode("free");
    setWorkoutTitle("Workout");
    setStartedAt(null);
  };

  return (
    <ActiveWorkoutContext.Provider
      value={{
        sections,
        setSections,
        mode,
        setMode,
        workoutTitle,
        setWorkoutTitle,
        startedAt,
        setStartedAt,
        clearWorkout,
      }}
    >
      {children}
    </ActiveWorkoutContext.Provider>
  );
}

export function useActiveWorkout(): ActiveWorkoutContextValue {
  const ctx = useContext(ActiveWorkoutContext);
  if (!ctx) {
    throw new Error(
      "useActiveWorkout must be used within an ActiveWorkoutProvider",
    );
  }
  return ctx;
}
