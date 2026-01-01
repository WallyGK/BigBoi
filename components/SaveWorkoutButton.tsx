import { addWorkoutLog } from "@/db/workoutLogs";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ViewStyle } from "react-native";
import Button from "./Button";

interface ExerciseSet {
  exerciseId: string;
  reps: number;
  weight: number;
  notes?: string;
}

interface SaveWorkoutButtonProps {
  workoutDate?: string;
  exercises: ExerciseSet[];
  style?: ViewStyle;
  onSaved?: () => void;
}

export default function SaveWorkoutButton({
  workoutDate,
  exercises,
  style,
  onSaved,
}: SaveWorkoutButtonProps) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      await addWorkoutLog(
        workoutDate || new Date().toISOString().slice(0, 10),
        exercises.map(({ exerciseId, ...rest }) => ({
          exercise_id: exerciseId,
          ...rest,
        }))
      );
      Alert.alert("Workout Saved", "Your workout has been logged.", [
        {
          text: "OK",
          onPress: () => {
            if (onSaved) onSaved();
            else router.back();
          },
        },
      ]);
    } catch (e) {
      Alert.alert("Error", `Failed to save workout. Please try again. ${e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      title={saving ? "Saving..." : "Complete & Save"}
      onPress={handleSave}
      disabled={saving}
      style={style}
    />
  );
}
