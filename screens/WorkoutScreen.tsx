import AddExercisePickerModal from "@/components/AddExercisePickerModal";
import Button from "@/components/Button";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import ExerciseSetSection from "@/components/ExerciseSetSection";
import SaveWorkoutButton from "@/components/SaveWorkoutButton";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenTitle from "@/components/ScreenTitle";
import SectionTitle from "@/components/SectionTitle";
import TemplateSelectForm from "@/components/TemplateSelectForm";
import ThemedModal from "@/components/ThemedModal";
import ThemedTextInput from "@/components/ThemedTextInput";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { getExercisesForTemplate, searchTemplatesAsync } from "@/db/templates";
import { Exercise, Template } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

export default function WorkoutScreen() {
  const { colors } = useContext(ThemeContext);
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  // Shared state
  const [sections, setSections] = useState<
    {
      exercise: Exercise;
      sets: { reps: string; weight: string; notes: string; done: boolean }[];
    }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Template mode state
  const [templateModalVisible, setTemplateModalVisible] = useState(
    mode === "template",
  );
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [deleteSetConfirmVisible, setDeleteSetConfirmVisible] = useState(false);
  const [pendingDeleteSet, setPendingDeleteSet] = useState<{
    sectionIdx: number;
    setIdx: number;
  } | null>(null);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [pendingNotesTarget, setPendingNotesTarget] = useState<{
    sectionIdx: number;
    setIdx: number;
  } | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Load templates for template mode
  useEffect(() => {
    if (templateModalVisible) {
      searchTemplatesAsync("").then(setTemplates);
    }
  }, [templateModalVisible]);

  // Handle template selection
  const handleGoTemplate = async () => {
    if (!selectedTemplate) return;
    const exercises = await getExercisesForTemplate(selectedTemplate.id);
    const newSections = exercises.map((ex) => ({
      exercise: ex,
      sets:
        Array.isArray(ex.setDetails) && ex.setDetails.length > 0
          ? [...ex.setDetails]
              .sort((a, b) => a.setOrder - b.setOrder)
              .map((set) => ({
                reps: set.reps?.toString() || "",
                weight: set.weight?.toString() || "",
                notes: set.notes || "",
                done: false,
              }))
          : Array.from({ length: Number(ex.sets || 1) }, () => ({
              reps: ex.reps?.toString() || "",
              weight: ex.weight?.toString() || "",
              notes: ex.notes || "",
              done: false,
            })),
    }));
    setSections(newSections);
    setTemplateModalVisible(false);
  };

  // Add exercise section (free mode)
  const handleAddSection = (exercise: Exercise) => {
    setSections((prev) => {
      if (prev.some((section) => section.exercise.id === exercise.id)) {
        setModalVisible(false);
        return prev;
      }
      return [
        ...prev,
        { exercise, sets: [{ reps: "", weight: "", notes: "", done: false }] },
      ];
    });
    setModalVisible(false);
  };

  // Set change
  const handleSetChange = (
    sectionIdx: number,
    setIdx: number,
    field: "reps" | "weight" | "notes",
    value: string,
  ) => {
    setSections((prev) => {
      const updated = [...prev];
      const section = { ...updated[sectionIdx] };
      const sets = [...section.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      section.sets = sets;
      updated[sectionIdx] = section;
      return updated;
    });
  };

  // Add set
  const handleAddSet = (sectionIdx: number) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[sectionIdx] = {
        ...updated[sectionIdx],
        sets: [
          ...updated[sectionIdx].sets,
          { reps: "", weight: "", notes: "", done: false },
        ],
      };
      return updated;
    });
  };

  const handleToggleSetDone = (sectionIdx: number, setIdx: number) => {
    setSections((prev) => {
      const updated = [...prev];
      const section = { ...updated[sectionIdx] };
      const sets = [...section.sets];
      sets[setIdx] = { ...sets[setIdx], done: !sets[setIdx].done };
      section.sets = sets;
      updated[sectionIdx] = section;
      return updated;
    });
  };

  const requestDeleteSet = (sectionIdx: number, setIdx: number) => {
    setPendingDeleteSet({ sectionIdx, setIdx });
    setDeleteSetConfirmVisible(true);
  };

  const handleConfirmDeleteSet = () => {
    if (!pendingDeleteSet) {
      setDeleteSetConfirmVisible(false);
      return;
    }

    const { sectionIdx, setIdx } = pendingDeleteSet;
    setSections((prev) => {
      const updated = [...prev];
      const section = updated[sectionIdx];
      if (!section) {
        return prev;
      }

      if (section.sets.length <= 1) {
        return prev.filter((_, idx) => idx !== sectionIdx);
      }

      const nextSets = section.sets.filter((_, idx) => idx !== setIdx);
      updated[sectionIdx] = {
        ...section,
        sets: nextSets,
      };

      return updated;
    });

    setDeleteSetConfirmVisible(false);
    setPendingDeleteSet(null);
  };

  const handleCancelDeleteSet = () => {
    setDeleteSetConfirmVisible(false);
    setPendingDeleteSet(null);
  };

  const openNotesEditor = (sectionIdx: number, setIdx: number) => {
    const current = sections[sectionIdx]?.sets[setIdx]?.notes || "";
    setPendingNotesTarget({ sectionIdx, setIdx });
    setNoteDraft(current);
    setNotesModalVisible(true);
  };

  const handleSaveNotes = () => {
    if (!pendingNotesTarget) {
      setNotesModalVisible(false);
      return;
    }

    handleSetChange(
      pendingNotesTarget.sectionIdx,
      pendingNotesTarget.setIdx,
      "notes",
      noteDraft,
    );
    setNotesModalVisible(false);
    setPendingNotesTarget(null);
  };

  const handleCancelNotes = () => {
    setNotesModalVisible(false);
    setPendingNotesTarget(null);
  };

  return (
    <ScreenContainer>
      {mode === "template" && (
        <ThemedModal
          visible={templateModalVisible}
          onClose={() => router.back()}
          style={{ justifyContent: "center" }}
        >
          <TemplateSelectForm
            templates={templates}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            onGo={handleGoTemplate}
            goDisabled={!selectedTemplate}
          />
        </ThemedModal>
      )}
      <ScreenTitle>
        {mode === "template"
          ? selectedTemplate?.name || "Workout from Template"
          : "Workout"}
      </ScreenTitle>
      <ScrollView contentContainerStyle={{ paddingVertical: SPACING.sm }}>
        {sections.map((section, sectionIdx) => (
          <ExerciseSetSection
            key={section.exercise.id}
            exerciseId={section.exercise.id}
            exerciseName={section.exercise.name}
            sets={section.sets}
            onChangeSet={(setIdx, field, value) =>
              handleSetChange(sectionIdx, setIdx, field, value)
            }
            onToggleSetDone={(setIdx) =>
              handleToggleSetDone(sectionIdx, setIdx)
            }
            onOpenNotes={(setIdx) => openNotesEditor(sectionIdx, setIdx)}
            onRequestDeleteSet={(setIdx) =>
              requestDeleteSet(sectionIdx, setIdx)
            }
            onAddSet={() => handleAddSet(sectionIdx)}
          />
        ))}
      </ScrollView>
      <AddExercisePickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectExercise={handleAddSection}
      />
      <View
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          padding: SPACING.sm,
          marginHorizontal: -SPACING.md,
          marginBottom: SPACING.md,
        }}
      >
        <Button
          title="Add Exercise"
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: colors.cardList,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: SPACING.sm,
          }}
        />
        <SaveWorkoutButton
          exercises={sections.flatMap((section) =>
            section.sets.map((set) => ({
              exerciseId: section.exercise.id,
              reps: set.reps ? parseInt(set.reps, 10) : 0,
              weight: set.weight ? parseFloat(set.weight) : 0,
              notes: set.notes,
            })),
          )}
        />
      </View>
      <ConfirmDeleteModal
        visible={deleteSetConfirmVisible}
        onConfirm={handleConfirmDeleteSet}
        onCancel={handleCancelDeleteSet}
        title="Delete this set?"
        message="This set will be removed from the workout."
      />
      <ThemedModal visible={notesModalVisible} onClose={handleCancelNotes}>
        <SectionTitle>Edit Set Notes</SectionTitle>
        <ThemedTextInput
          value={noteDraft}
          onChangeText={setNoteDraft}
          placeholder="Add notes for this set"
          multiline
          style={{
            minHeight: 90,
            marginBottom: SPACING.md,
            paddingHorizontal: 10,
          }}
        />
        <Button title="Save Notes" onPress={handleSaveNotes} />
        <Button
          title="Cancel"
          onPress={handleCancelNotes}
          style={{ marginTop: SPACING.sm, backgroundColor: colors.error }}
        />
      </ThemedModal>
    </ScreenContainer>
  );
}
