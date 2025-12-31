import AddExerciseForm from "@/components/AddExerciseForm";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import ExerciseListItem from "@/components/ExerciseListItem";
import FloatingButton from "@/components/FloatingButton";
import ThemedModal from "@/components/ThemedModal";
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import {
  addExercise,
  deleteExerciseAsync,
  searchExercisesAsync,
  updateExerciseAsync,
} from "@/db/exercises";
import { Exercise, NewExercise } from "@/types";
import { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Exercises() {
  const { colors } = useContext(ThemeContext);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Saved Exercises:
      </Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseListItem
            exercise={item}
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
            bottom: SPACING.xl + insets.bottom,
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    marginVertical: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
  },
  muscle: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
});
