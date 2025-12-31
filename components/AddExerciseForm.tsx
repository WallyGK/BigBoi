import Button from "@/components/Button";
import {
  BORDER_RADIUS,
  FONT_SIZE,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { Exercise, NewExercise } from "@/types";
import { useContext, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

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
      <Text style={[styles.title, { color: colors.text }]}>
        {isEdit ? "Edit Exercise" : "Add New Exercise"}
      </Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      />
      <TextInput
        placeholder="Muscle Group"
        placeholderTextColor={colors.textSecondary}
        value={muscleGroup}
        onChangeText={setMuscleGroup}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      />
      <TextInput
        placeholder="Description"
        placeholderTextColor={colors.textSecondary}
        value={description}
        onChangeText={setDescription}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      />

      <Button
        title={
          loading ? "Saving..." : isEdit ? "Update Exercise" : "Save Exercise"
        }
        onPress={handleSave}
        disabled={!name.trim() || loading}
        style={styles.saveButton}
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
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  saveButton: {
    marginTop: SPACING.sm,
  },
});
