const STRONG_EXERCISE_MUSCLE_GROUPS: Record<string, string> = {
  "Bench Press (Dumbbell)": "Chest",
  "Incline Bench Press (Dumbbell)": "Chest",
  "Incline Cable Fly": "Chest",
  "Chest Press (Machine)": "Chest",
  "Pullover (Machine)": "Back",
  "Lat Pulldown (Cable)": "Back",
  "Lat Pulldown - Wide Grip (Cable)": "Back",
  "Seated Row (Cable)": "Back",
  "Single Arm Cable Row": "Back",
  "Seated Deadlift (Cable)": "Back",
  "Face Pull (Cable)": "Shoulders",
  "Shoulder Press (Machine)": "Shoulders",
  "Seated Overhead Press (Dumbbell)": "Shoulders",
  "Lateral Raise (Dumbbell)": "Shoulders",
  "Lateral Raise (Cable)": "Shoulders",
  "Triceps Extension": "Arms",
  "Triceps Pushdown (Cable - Straight Bar)": "Arms",
  "Bicep Curl (Dumbbell)": "Arms",
  "Bicep Curl (Cable)": "Arms",
  "Goblet Squat (Kettlebell)": "Legs",
  "Bulgarian Split Squat": "Legs",
  "Deadlift (Smith Machine)": "Legs",
  "Romanian Deadlift (Dumbbell)": "Legs",
  "Seated Leg Press (Machine)": "Legs",
  "Lying Leg Curl (Machine)": "Legs",
  "Leg Extension (Machine)": "Legs",
  "Calf Press on Seated Leg Press": "Legs",
};

export function getStrongExerciseMuscleGroup(exerciseName: string): string {
  return STRONG_EXERCISE_MUSCLE_GROUPS[exerciseName] || "";
}
