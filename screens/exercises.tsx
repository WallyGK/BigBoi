// app/(tabs)/exercises.tsx
import AddExerciseForm from "@/components/AddExerciseForm";
import Card from "@/components/Card";
import ThemedModal from "@/components/ThemedModal";
import { SHADOW, SPACING, ThemeContext } from "@/constants/Theme";
import {
  addExercise,
  deleteExerciseAsync,
  searchExercisesAsync,
  updateExerciseAsync,
} from "@/db/exercises";
import { Exercise, NewExercise } from "@/types";
import { useContext, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Exercises() {
  const { colors } = useContext(ThemeContext);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const insets = useSafeAreaInsets();

  // Load exercises from SQLite
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
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setSelectedExercise(item);
              setModalVisible(true);
            }}
          >
            <Card style={{ backgroundColor: colors.card }}>
              <Text style={[styles.name, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.muscle, { color: colors.textSecondary }]}>
                {item.muscleGroup || "Unspecified"}
              </Text>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingVertical: SPACING.md }}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.xs }} />}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[
          styles.addButton,
          {
            backgroundColor: colors.primary,
            bottom: SPACING.xl + insets.bottom,
          },
        ]}
        onPress={() => {
          setSelectedExercise(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <ThemedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <AddExerciseForm
          exercise={selectedExercise}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveExercise}
          onDelete={async (id: string) => {
            await deleteExerciseAsync(id);
            await loadExercises();
          }}
        />
      </ThemedModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: SPACING.md,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  muscle: {
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  addButton: {
    position: "absolute",
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOW.default,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
  },
});
