import Button from "@/components/Button";
import ScreenTitle from "@/components/ScreenTitle";
import ThemedTextInput from "@/components/ThemedTextInput";
import { BORDER_RADIUS, SPACING, ThemeContext } from "@/constants/Theme";
import { Exercise, NewExercise } from "@/types";
import { useContext, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

interface AddExerciseFormProps {
  onClose: () => void;
  onSave: (exerciseData: Exercise | NewExercise) => void;
  exercise?: Exercise | null;
}

export default function AddExerciseForm({
  onClose,
  onSave,
  exercise,
}: AddExerciseFormProps) {
  const { colors } = useContext(ThemeContext);
  const isEdit = !!exercise;

  const [name, setName] = useState(exercise?.name || "");
  const [muscleGroup, setMuscleGroup] = useState(exercise?.muscleGroup || "");
  const [description, setDescription] = useState(exercise?.description || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSave({
        id: exercise?.id,
        name: name.trim(),
        muscleGroup: muscleGroup.trim(),
        description: description.trim(),
      });
      setName("");
      setMuscleGroup("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to save exercise:", error);
      Alert.alert("Error", "Failed to save exercise.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <ScreenTitle>{isEdit ? "Edit Exercise" : "Add New Exercise"}</ScreenTitle>

      <ThemedTextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: SPACING.md }}
      />
      <ThemedTextInput
        placeholder="Muscle Group"
        value={muscleGroup}
        onChangeText={setMuscleGroup}
        style={{ marginBottom: SPACING.md }}
      />
      <ThemedTextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={{ marginBottom: SPACING.md }}
      />

      <Button
        title={
          loading ? "Saving..." : isEdit ? "Update Exercise" : "Save Exercise"
        }
        onPress={handleSave}
        disabled={!name.trim() || loading}
        style={{ marginTop: SPACING.sm }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    position: "relative",
    justifyContent: "flex-start",
  },
});
