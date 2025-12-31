// screens/EditTemplate.tsx
import AddExerciseToTemplateForm from "@/components/AddExerciseToTemplateForm";
import Button from "@/components/Button";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import FloatingButton from "@/components/FloatingButton";
import ListItem from "@/components/ListItem";
import ScreenTitle from "@/components/ScreenTitle";
import SectionTitle from "@/components/SectionTitle";
import ThemedModal from "@/components/ThemedModal";
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
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
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
            weight: ex.weight?.toString() || "",
            notes: ex.notes || "",
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
            Number(ex.weight) || 0,
            ex.notes || ""
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
  const [notes, setNotes] = useState("");
  // For editing an existing exercise in the template
  const [editExerciseIndex, setEditExerciseIndex] = useState<number | null>(
    null
  );

  // Open modal for adding a new exercise
  const openAddExerciseModal = async () => {
    const dbExercises = await searchExercisesAsync("");
    setAllExercises(dbExercises);
    setSelectedExercise(null);
    setReps("");
    setSets("");
    setWeight("");
    setNotes("");
    setEditExerciseIndex(null);
    setModalVisible(true);
  };

  // Open modal for editing an existing exercise in the template
  const openEditExerciseModal = async (idx: number) => {
    const dbExercises = await searchExercisesAsync("");
    setAllExercises(dbExercises);
    const exObj = exercises[idx];
    setSelectedExercise(exObj.exercise);
    setReps(exObj.reps);
    setSets(exObj.sets);
    setWeight(exObj.weight);
    setNotes(exObj.notes || "");
    setEditExerciseIndex(idx);
    setModalVisible(true);
  };

  // Add or update exercise in template
  const handleAddExercise = () => {
    if (!selectedExercise) return;
    if (editExerciseIndex !== null) {
      // Update existing
      const updated = [...exercises];
      updated[editExerciseIndex] = {
        exercise: selectedExercise,
        reps,
        sets,
        weight,
        notes,
      };
      setExercises(updated);
    } else {
      // Add new
      setExercises([
        ...exercises,
        {
          exercise: selectedExercise,
          reps,
          sets,
          weight,
          notes,
        },
      ]);
    }
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
          <ListItem
            title={item.exercise?.name || ""}
            subtitle={
              item.reps || item.sets || item.weight
                ? `${item.reps || "-"} reps x ${item.sets || "-"} sets @ ${
                    item.weight || "-"
                  }lbs`
                : undefined
            }
            description={item.notes}
            onRemove={() => handleRemoveExercise(index)}
            onPress={() => openEditExerciseModal(index)}
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
      <ThemedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <AddExerciseToTemplateForm
          allExercises={allExercises}
          selectedExercise={selectedExercise}
          setSelectedExercise={setSelectedExercise}
          reps={reps}
          setReps={setReps}
          sets={sets}
          setSets={setSets}
          weight={weight}
          setWeight={setWeight}
          notes={notes}
          setNotes={setNotes}
          onAdd={handleAddExercise}
          onCancel={() => setModalVisible(false)}
        />
      </ThemedModal>

      {/* Save Button */}
      <View style={{ paddingBottom: insets.bottom || SPACING.md }}>
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
  saveButton: {
    marginTop: SPACING.lg,
  },
});
