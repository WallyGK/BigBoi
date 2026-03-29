import AddExercisePickerModal from "@/components/AddExercisePickerModal";
import Button from "@/components/Button";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import ExerciseRow from "@/components/ExerciseRow";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenTitle from "@/components/ScreenTitle";
import SectionTitle from "@/components/SectionTitle";
import SwipeDeleteRightAction from "@/components/SwipeDeleteRightAction";
import ThemedModal from "@/components/ThemedModal";
import ThemedTextInput from "@/components/ThemedTextInput";
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import {
  addExerciseToTemplate,
  addTemplate,
  deleteTemplateAsync,
  getExercisesForTemplate,
  getTemplateById,
  removeExerciseFromTemplate,
} from "@/db/templates";
import { Exercise } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

type TemplateSetInput = {
  reps: string;
  weight: string;
  notes: string;
  done: boolean;
};

type TemplateSection = {
  exercise: Exercise;
  sets: TemplateSetInput[];
};

export default function EditTemplate() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useContext(ThemeContext);

  const templateId =
    typeof params.templateId === "string" ? params.templateId : null;

  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [originalExerciseIds, setOriginalExerciseIds] = useState<string[]>([]);

  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);

  const [deleteTemplateConfirmVisible, setDeleteTemplateConfirmVisible] =
    useState(false);
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

  useEffect(() => {
    let isMounted = true;

    async function loadTemplateForEdit() {
      if (!templateId) {
        return;
      }

      const template = await getTemplateById(templateId);
      if (!template || !isMounted) {
        return;
      }

      setTemplateName(template.name);
      setTemplateDesc(template.description || "");

      const templateExercises = await getExercisesForTemplate(templateId);
      if (!isMounted) {
        return;
      }

      const mappedSections: TemplateSection[] = templateExercises.map((ex) => {
        const orderedSetDetails = (ex.setDetails || [])
          .slice()
          .sort((a, b) => a.setOrder - b.setOrder);

        const sets =
          orderedSetDetails.length > 0
            ? orderedSetDetails.map((set) => ({
                reps: String(set.reps ?? ""),
                weight: String(set.weight ?? ""),
                notes: set.notes || "",
                done: false,
              }))
            : Array.from({ length: Math.max(1, ex.sets || 1) }, () => ({
                reps: String(ex.reps ?? ""),
                weight: String(ex.weight ?? ""),
                notes: ex.notes || "",
                done: false,
              }));

        return {
          exercise: ex,
          sets,
        };
      });

      setSections(mappedSections);
      setOriginalExerciseIds(
        mappedSections.map((section) => section.exercise.id),
      );
    }

    loadTemplateForEdit();

    return () => {
      isMounted = false;
    };
  }, [templateId]);

  const handleAddExerciseSection = (exercise: Exercise) => {
    setSections((prev) => {
      if (prev.some((section) => section.exercise.id === exercise.id)) {
        return prev;
      }

      return [
        ...prev,
        { exercise, sets: [{ reps: "", weight: "", notes: "", done: false }] },
      ];
    });

    setExerciseModalVisible(false);
  };

  const handleRemoveExerciseSection = (sectionIdx: number) => {
    setSections((prev) => prev.filter((_, idx) => idx !== sectionIdx));
  };

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

  const handleAddSet = (sectionIdx: number) => {
    setSections((prev) => {
      const updated = [...prev];
      const section = updated[sectionIdx];
      if (!section) {
        return prev;
      }

      updated[sectionIdx] = {
        ...section,
        sets: [
          ...section.sets,
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

      updated[sectionIdx] = {
        ...section,
        sets: section.sets.filter((_, idx) => idx !== setIdx),
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
    setPendingNotesTarget({ sectionIdx, setIdx });
    setNoteDraft(sections[sectionIdx]?.sets[setIdx]?.notes || "");
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

  const handleDeleteTemplate = async () => {
    if (!templateId) {
      return;
    }

    try {
      await deleteTemplateAsync(templateId);
      setDeleteTemplateConfirmVisible(false);
      router.back();
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      return;
    }

    try {
      let activeTemplateId = templateId;

      if (!activeTemplateId) {
        const created = await addTemplate({
          name: templateName.trim(),
          description: templateDesc.trim(),
          exercises: [],
        });

        if (!created) {
          throw new Error("Failed to create template");
        }

        activeTemplateId = created.id;
      }

      if (!activeTemplateId) {
        throw new Error("Missing template id");
      }

      const currentExerciseIds = sections.map((section) => section.exercise.id);
      const removedExerciseIds = originalExerciseIds.filter(
        (id) => !currentExerciseIds.includes(id),
      );

      for (const removedExerciseId of removedExerciseIds) {
        await removeExerciseFromTemplate(activeTemplateId, removedExerciseId);
      }

      for (const section of sections) {
        const setEntries = section.sets.map((set) => ({
          reps: Number(set.reps) || 0,
          weight: Number(set.weight) || 0,
          notes: set.notes || "",
        }));

        const firstSet = setEntries[0] || { reps: 0, weight: 0, notes: "" };

        await addExerciseToTemplate(
          activeTemplateId,
          section.exercise.id,
          setEntries.length,
          firstSet.reps,
          firstSet.weight,
          firstSet.notes,
          setEntries,
        );
      }

      router.back();
    } catch (error) {
      console.error("Failed to save template:", error);
    }
  };

  return (
    <ScreenContainer>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ScreenTitle>Edit Template</ScreenTitle>
        {templateId ? (
          <Pressable
            onPress={() => setDeleteTemplateConfirmVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={28} color={colors.error} />
          </Pressable>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      <ThemedTextInput
        placeholder="Template Name"
        value={templateName}
        onChangeText={setTemplateName}
      />
      <ThemedTextInput
        placeholder="Template Description"
        value={templateDesc}
        onChangeText={setTemplateDesc}
        multiline
      />

      <ScrollView contentContainerStyle={{ paddingVertical: SPACING.sm }}>
        {sections.length === 0 ? (
          <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
            No exercises added yet.
          </Text>
        ) : (
          sections.map((section, sectionIdx) => (
            <View
              key={section.exercise.id}
              style={{
                marginBottom: SPACING.md,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                padding: SPACING.sm,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: SPACING.sm,
                }}
              >
                <SectionTitle style={{ fontSize: FONT_SIZE.lg }}>
                  {section.exercise.name}
                </SectionTitle>
                <View style={{ flex: 1 }} />
                <Pressable
                  onPress={() => handleRemoveExerciseSection(sectionIdx)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={colors.error}
                  />
                </Pressable>
              </View>

              {section.sets.map((set, setIdx) => (
                <ReanimatedSwipeable
                  key={`${section.exercise.id}-set-${setIdx}`}
                  overshootRight={false}
                  renderRightActions={(progress) => (
                    <SwipeDeleteRightAction
                      progress={progress}
                      onPress={() => requestDeleteSet(sectionIdx, setIdx)}
                      colors={{ error: colors.error, text: colors.text }}
                    />
                  )}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      opacity: set.done ? 0.45 : 1,
                      backgroundColor: set.done ? colors.border : "transparent",
                      borderRadius: 8,
                      paddingHorizontal: SPACING.xs,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <ExerciseRow
                        setNumber={setIdx + 1}
                        reps={set.reps}
                        weight={set.weight}
                        onChangeReps={(value) =>
                          handleSetChange(sectionIdx, setIdx, "reps", value)
                        }
                        onChangeWeight={(value) =>
                          handleSetChange(sectionIdx, setIdx, "weight", value)
                        }
                      />
                    </View>
                    <Button
                      title="+"
                      onPress={() => openNotesEditor(sectionIdx, setIdx)}
                      style={{
                        width: 32,
                        height: 32,
                        marginLeft: SPACING.xs,
                        marginBottom: SPACING.xs,
                        paddingVertical: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: set.notes?.trim()
                          ? colors.secondary
                          : colors.primary,
                      }}
                    />
                    <Button
                      title="✓"
                      onPress={() => handleToggleSetDone(sectionIdx, setIdx)}
                      style={{
                        width: 32,
                        height: 32,
                        marginLeft: SPACING.xs,
                        marginBottom: SPACING.xs,
                        paddingVertical: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: set.done
                          ? colors.secondary
                          : colors.cardList,
                        borderWidth: 1,
                        borderColor: set.done
                          ? colors.secondary
                          : colors.border,
                      }}
                    />
                  </View>
                </ReanimatedSwipeable>
              ))}

              <Button
                title="Add Set"
                onPress={() => handleAddSet(sectionIdx)}
                style={{
                  width: "100%",
                  height: 30,
                  paddingVertical: 0,
                  marginTop: SPACING.xs,
                }}
              />
            </View>
          ))
        )}
      </ScrollView>

      <AddExercisePickerModal
        visible={exerciseModalVisible}
        onClose={() => setExerciseModalVisible(false)}
        onSelectExercise={handleAddExerciseSection}
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
          onPress={() => setExerciseModalVisible(true)}
          style={{
            backgroundColor: colors.cardList,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: SPACING.sm,
          }}
        />

        <ConfirmDeleteModal
          visible={deleteTemplateConfirmVisible}
          onConfirm={handleDeleteTemplate}
          onCancel={() => setDeleteTemplateConfirmVisible(false)}
          title="Delete Template?"
          message="Are you sure you want to delete this template? This action cannot be undone."
        />

        <ConfirmDeleteModal
          visible={deleteSetConfirmVisible}
          onConfirm={handleConfirmDeleteSet}
          onCancel={handleCancelDeleteSet}
          title="Delete this set?"
          message="This set will be removed from the template."
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

        <Button
          title="Save Template"
          onPress={handleSaveTemplate}
          style={{ marginTop: SPACING.xs }}
        />
      </View>
    </ScreenContainer>
  );
}
