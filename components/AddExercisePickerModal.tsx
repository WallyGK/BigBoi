import Button from "@/components/Button";
import ListItem from "@/components/ListItem";
import SectionTitle from "@/components/SectionTitle";
import ThemedModal from "@/components/ThemedModal";
import ThemedTextInput from "@/components/ThemedTextInput";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { addExercise, searchExercisesAsync } from "@/db/exercises";
import { Exercise } from "@/types";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Keyboard, ScrollView, Text, View } from "react-native";

type AddExercisePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  title?: string;
};

export default function AddExercisePickerModal({
  visible,
  onClose,
  onSelectExercise,
  title = "Select Exercise to Add",
}: AddExercisePickerModalProps) {
  const { colors } = useContext(ThemeContext);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [showCreateExerciseForm, setShowCreateExerciseForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState("");
  const [newExerciseDescription, setNewExerciseDescription] = useState("");
  const [creatingExercise, setCreatingExercise] = useState(false);

  const loadExercises = async (query: string = "") => {
    setLoadingExercises(true);
    try {
      const result = await searchExercisesAsync(query);
      setExercises(result);
    } finally {
      setLoadingExercises(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSearchQuery("");
    setShowCreateExerciseForm(false);
    setNewExerciseName("");
    setNewExerciseMuscleGroup("");
    setNewExerciseDescription("");
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(() => {
      loadExercises(searchQuery);
    }, 120);

    return () => clearTimeout(timer);
  }, [searchQuery, visible]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleCreateExercise = async () => {
    const name = newExerciseName.trim();
    if (!name) {
      Alert.alert("Exercise Name Required", "Please enter an exercise name.");
      return;
    }

    setCreatingExercise(true);
    try {
      const created = await addExercise({
        name,
        muscleGroup: newExerciseMuscleGroup.trim(),
        description: newExerciseDescription.trim(),
      });

      if (!created) {
        throw new Error("Failed to create exercise");
      }

      await loadExercises(searchQuery);
      onSelectExercise(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Create Exercise Failed", message);
    } finally {
      setCreatingExercise(false);
    }
  };

  return (
    <ThemedModal visible={visible} onClose={onClose}>
      <SectionTitle>{title}</SectionTitle>
      <ThemedTextInput
        placeholder="Search exercises"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ marginBottom: SPACING.sm }}
      />

      <View style={{ height: isKeyboardVisible ? 180 : 240 }}>
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          {exercises.length === 0 && !loadingExercises ? (
            <Text
              style={{
                textAlign: "center",
                paddingVertical: SPACING.sm,
                color: colors.textSecondary,
              }}
            >
              No exercises found.
            </Text>
          ) : (
            exercises.map((exercise) => (
              <ListItem
                key={exercise.id}
                title={exercise.name}
                subtitle={exercise.muscleGroup}
                description={exercise.description}
                onPress={() => onSelectExercise(exercise)}
                showRemove={false}
                style={{ backgroundColor: colors.cardList }}
              />
            ))
          )}
        </ScrollView>
      </View>

      {showCreateExerciseForm && (
        <View style={{ marginTop: SPACING.sm, marginBottom: SPACING.sm }}>
          <ThemedTextInput
            placeholder="Exercise Name"
            value={newExerciseName}
            onChangeText={setNewExerciseName}
            style={{ marginBottom: SPACING.sm }}
          />
          <ThemedTextInput
            placeholder="Muscle Group (optional)"
            value={newExerciseMuscleGroup}
            onChangeText={setNewExerciseMuscleGroup}
            style={{ marginBottom: SPACING.sm }}
          />
          <ThemedTextInput
            placeholder="Description (optional)"
            value={newExerciseDescription}
            onChangeText={setNewExerciseDescription}
            style={{ marginBottom: SPACING.sm }}
          />
          <Button
            title={creatingExercise ? "Creating..." : "Create & Add"}
            onPress={handleCreateExercise}
            disabled={creatingExercise || !newExerciseName.trim()}
          />
        </View>
      )}

      <Button
        title={
          showCreateExerciseForm
            ? "Hide New Exercise Form"
            : "Create New Exercise"
        }
        onPress={() => setShowCreateExerciseForm((prev) => !prev)}
        style={{ marginTop: SPACING.sm, marginBottom: SPACING.xs }}
      />
    </ThemedModal>
  );
}
