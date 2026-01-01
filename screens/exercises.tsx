import AddExerciseForm from "@/components/AddExerciseForm";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import FloatingButton from "@/components/FloatingButton";
import ListItem from "@/components/ListItem";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenTitle from "@/components/ScreenTitle";
import ThemedModal from "@/components/ThemedModal";
import { SPACING } from "@/constants/Theme";
import {
  addExercise,
  deleteExerciseAsync,
  searchExercisesAsync,
  updateExerciseAsync,
} from "@/db/exercises";
import { Exercise, NewExercise } from "@/types";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const loadExercises = async () => {
    const allExercises = await searchExercisesAsync("");
    setExercises(allExercises);
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const handleSaveExercise = async (exerciseData: Exercise | NewExercise) => {
    if ("id" in exerciseData && exerciseData.id) {
      await updateExerciseAsync(exerciseData);
    } else {
      await addExercise(exerciseData);
    }
    await loadExercises();
    setModalVisible(false);
  };

  const handleDeleteExercise = async () => {
    if (!selectedExercise) return;
    await deleteExerciseAsync(selectedExercise.id);
    await loadExercises();
    setDeleteConfirmVisible(false);
    setModalVisible(false);
  };

  return (
    <ScreenContainer>
      <ScreenTitle>Saved Exercises:</ScreenTitle>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            title={item.name}
            subtitle={item.muscleGroup}
            description={item.description || ""}
            onPress={() => {
              setSelectedExercise(item);
              setModalVisible(true);
            }}
          />
        )}
        contentContainerStyle={{ paddingVertical: SPACING.md }}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.xs }} />}
      />

      {/* Floating Add Button */}
      <FloatingButton
        style={[
          {
            bottom: SPACING.md,
          },
        ]}
        onPress={() => {
          setSelectedExercise(null);
          setModalVisible(true);
        }}
      >
        {"+"}
      </FloatingButton>

      {/* Modal */}
      <ThemedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onDelete={
          selectedExercise ? () => setDeleteConfirmVisible(true) : undefined
        }
      >
        <AddExerciseForm
          exercise={selectedExercise}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveExercise}
        />
      </ThemedModal>

      <ConfirmDeleteModal
        visible={deleteConfirmVisible}
        onConfirm={handleDeleteExercise}
        onCancel={() => setDeleteConfirmVisible(false)}
        title="Delete Exercise?"
        message="Are you sure you want to delete this exercise? This action cannot be undone."
      />
    </ScreenContainer>
  );
}
