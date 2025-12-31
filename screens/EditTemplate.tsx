// screens/EditTemplate.tsx
import Button from "@/components/Button";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import ExerciseListItem from "@/components/ExerciseListItem";
import FloatingButton from "@/components/FloatingButton";
import ScreenTitle from "@/components/ScreenTitle";
import SectionTitle from "@/components/SectionTitle";
import {
  BORDER_RADIUS,
  FONT_SIZE,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { searchExercisesAsync } from "@/db/exercises";
import {
  addExerciseToTemplate,
  addTemplate,
  deleteTemplateAsync,
} from "@/db/templates";
import { Exercise } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditTemplate() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const templateId =
    typeof params.templateId === "string" ? params.templateId : null;

  // State for form fields
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [exercises, setExercises] = useState<any[]>([]);
  const [originalExercises, setOriginalExercises] = useState<any[]>([]);

  // Load template data if editing
  React.useEffect(() => {
    async function loadTemplateForEdit() {
      if (templateId) {
        const { getTemplateById, getExercisesForTemplate } = await import(
          "@/db/templates"
        );
        const template = await getTemplateById(templateId);
        if (template) {
          setTemplateName(template.name);
          setTemplateDesc(template.description || "");
          const templateExercises = await getExercisesForTemplate(templateId);
          const mappedExercises = templateExercises.map((ex) => ({
            exercise: ex,
            reps: ex.reps?.toString() || "",
            sets: ex.sets?.toString() || "",
            weight: "", // Add weight if you store it
          }));
          setExercises(mappedExercises);
          setOriginalExercises(mappedExercises);
        }
      }
    }
    loadTemplateForEdit();
  }, [templateId]);

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const handleDeleteTemplate = async () => {
    if (!templateId) return;
    try {
      await deleteTemplateAsync(templateId);
      setDeleteConfirmVisible(false);
      router.back();
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    try {
      let newTemplateId = templateId;
      if (!templateId) {
        const newTemplate = await addTemplate({
          name: templateName.trim(),
          description: templateDesc.trim(),
          exercises: [],
        });
        if (!newTemplate) throw new Error("Failed to create template");
        newTemplateId = newTemplate.id;
      }
      if (typeof newTemplateId === "string") {
        // Find removed exercises
        const removed = originalExercises.filter(
          (orig) => !exercises.some((ex) => ex.exercise.id === orig.exercise.id)
        );
        if (removed.length > 0) {
          const { removeExerciseFromTemplate } = await import("@/db/templates");
          for (const ex of removed) {
            await removeExerciseFromTemplate(newTemplateId, ex.exercise.id);
          }
        }
        // Add/update current exercises
        for (const ex of exercises) {
          await addExerciseToTemplate(
            newTemplateId,
            ex.exercise.id,
            Number(ex.sets) || 0,
            Number(ex.reps) || 0,
            ""
          );
        }
      }
      router.back();
    } catch (err) {
      console.error("Failed to save template:", err);
    }
  };
  const { colors } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [weight, setWeight] = useState("");

  // Load all saved exercises when modal opens
  const openAddExerciseModal = async () => {
    const dbExercises = await searchExercisesAsync("");
    setAllExercises(dbExercises);
    setSelectedExercise(null);
    setReps("");
    setSets("");
    setWeight("");
    setModalVisible(true);
  };

  const handleAddExercise = () => {
    if (!selectedExercise) return;
    setExercises([
      ...exercises,
      {
        exercise: selectedExercise,
        reps,
        sets,
        weight,
      },
    ]);
    setModalVisible(false);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTitle>Edit Template</ScreenTitle>
      <TextInput
        placeholder="Template Name"
        placeholderTextColor={colors.textSecondary}
        value={templateName}
        onChangeText={setTemplateName}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      />
      <TextInput
        placeholder="Template Description"
        placeholderTextColor={colors.textSecondary}
        value={templateDesc}
        onChangeText={setTemplateDesc}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
        multiline
      />

      <SectionTitle>Exercises</SectionTitle>
      <FlatList
        data={exercises}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <ExerciseListItem
            exercise={item.exercise}
            reps={item.reps}
            sets={item.sets}
            weight={item.weight}
            onRemove={() => handleRemoveExercise(index)}
            displayMode="name"
          />
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
            No exercises added yet.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Floating Add Button */}
      <FloatingButton
        onPress={openAddExerciseModal}
        style={{
          bottom: (insets.bottom || 16) + 72,
          right: SPACING.md,
        }}
      >
        {"+"}
      </FloatingButton>

      {/* Floating Delete Button */}
      <FloatingButton
        onPress={() => setDeleteConfirmVisible(true)}
        style={{
          bottom: (insets.bottom || 16) + 72,
          left: SPACING.md,
          backgroundColor: colors.error,
        }}
      >
        <Ionicons name="trash-outline" size={32} color={colors.text} />
      </FloatingButton>

      <ConfirmDeleteModal
        visible={deleteConfirmVisible}
        onConfirm={handleDeleteTemplate}
        onCancel={() => setDeleteConfirmVisible(false)}
        title="Delete Template?"
        message="Are you sure you want to delete this template? This action cannot be undone."
      />

      {/* Modal for adding exercise */}

      <FloatingButton
        onPress={openAddExerciseModal}
        style={{
          bottom: (insets.bottom || 16) + 72,
          right: SPACING.md,
        }}
      >
        {"+"}
      </FloatingButton>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <SectionTitle>Add Exercise</SectionTitle>
            <FlatList
              data={allExercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.exerciseOption,
                    selectedExercise?.id === item.id && {
                      backgroundColor: colors.primary + "33",
                    },
                  ]}
                  onPress={() => setSelectedExercise(item)}
                >
                  <Text style={{ color: colors.text }}>{item.name}</Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: FONT_SIZE.sm,
                    }}
                  >
                    {item.muscleGroup}
                  </Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 180 }}
            />
            <TextInput
              placeholder="Sets"
              placeholderTextColor={colors.textSecondary}
              value={sets}
              onChangeText={setSets}
              keyboardType="numeric"
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
              placeholder="Reps"
              placeholderTextColor={colors.textSecondary}
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
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
              placeholder="Weight (lb)"
              placeholderTextColor={colors.textSecondary}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
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
              title="Add to Template"
              onPress={handleAddExercise}
              disabled={!selectedExercise || !reps || !sets}
              style={{ marginTop: SPACING.md }}
            />
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              style={{ marginTop: SPACING.sm, backgroundColor: colors.error }}
            />
          </View>
        </View>
      </Modal>

      {/* Save Button */}
      <View style={{ paddingBottom: insets.bottom || 16 }}>
        <Button
          title="Save Template"
          onPress={handleSaveTemplate}
          style={styles.saveButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "stretch",
  },
  exerciseOption: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});
