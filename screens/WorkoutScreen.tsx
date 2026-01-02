import Button from "@/components/Button";
import ExerciseRow from "@/components/ExerciseRow";
import FloatingButton from "@/components/FloatingButton";
import ListItem from "@/components/ListItem";
import SaveWorkoutButton from "@/components/SaveWorkoutButton";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenTitle from "@/components/ScreenTitle";
import SectionTitle from "@/components/SectionTitle";
import TemplateSelectForm from "@/components/TemplateSelectForm";
import ThemedModal from "@/components/ThemedModal";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { searchExercisesAsync } from "@/db/exercises";
import { getExercisesForTemplate, searchTemplatesAsync } from "@/db/templates";
import { Exercise } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function WorkoutScreen() {
  const { colors } = useContext(ThemeContext);
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  // Shared state
  const [sections, setSections] = useState<
    {
      exercise: Exercise;
      sets: { reps: string; weight: string; notes: string }[];
    }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Template mode state
  const [templateModalVisible, setTemplateModalVisible] = useState(
    mode === "template"
  );
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Load exercises for modal
  useEffect(() => {
    if (modalVisible) {
      setLoadingExercises(true);
      searchExercisesAsync("").then((data) => {
        setExercises(data);
        setLoadingExercises(false);
      });
    }
  }, [modalVisible]);

  // Load templates for template mode
  useEffect(() => {
    if (templateModalVisible) {
      searchTemplatesAsync("").then(setTemplates);
    }
  }, [templateModalVisible]);

  // Handle template selection
  const handleGoTemplate = async () => {
    if (!selectedTemplate) return;
    let exercises = selectedTemplate.exercises;
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      try {
        exercises = await getExercisesForTemplate(selectedTemplate.id);
      } catch {
        exercises = [];
      }
    }
    const newSections = (exercises || []).map((ex: any) => ({
      exercise: ex.exercise || ex,
      sets: Array.from({ length: Number(ex.sets || 1) }, (_, i) => ({
        reps: ex.reps?.toString() || "",
        weight: ex.weight?.toString() || "",
        notes: "",
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
        { exercise, sets: [{ reps: "", weight: "", notes: "" }] },
      ];
    });
    setModalVisible(false);
  };

  // Set change
  const handleSetChange = (
    sectionIdx: number,
    setIdx: number,
    field: "reps" | "weight" | "notes",
    value: string
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
          { reps: "", weight: "", notes: "" },
        ],
      };
      return updated;
    });
  };

  // Remove last set
  const handleRemoveSet = (sectionIdx: number) => {
    setSections((prev) => {
      const updated = [...prev];
      const sets = updated[sectionIdx].sets;
      if (sets.length > 1) {
        updated[sectionIdx] = {
          ...updated[sectionIdx],
          sets: sets.slice(0, -1),
        };
      }
      return updated;
    });
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
          <View key={section.exercise.id} style={{ marginBottom: SPACING.lg }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: SPACING.sm,
                gap: 8,
              }}
            >
              <SectionTitle>{section.exercise.name}</SectionTitle>
              <View style={{ flex: 1 }} />
              <Button
                title="Set -"
                onPress={() => handleRemoveSet(sectionIdx)}
                style={{
                  minWidth: 60,
                  height: 28,
                  backgroundColor: colors.error,
                  paddingVertical: 0,
                }}
              />
              <Button
                title="Set +"
                onPress={() => handleAddSet(sectionIdx)}
                style={{
                  minWidth: 60,
                  height: 28,
                  marginLeft: 8,
                  paddingVertical: 0,
                }}
              />
            </View>
            {section.sets.map((set, setIdx) => (
              <ExerciseRow
                key={setIdx}
                setNumber={setIdx + 1}
                reps={set.reps}
                weight={set.weight}
                notes={set.notes}
                onChangeReps={(v) =>
                  handleSetChange(sectionIdx, setIdx, "reps", v)
                }
                onChangeWeight={(v) =>
                  handleSetChange(sectionIdx, setIdx, "weight", v)
                }
                onChangeNotes={(v) =>
                  handleSetChange(sectionIdx, setIdx, "notes", v)
                }
              />
            ))}
          </View>
        ))}
      </ScrollView>
      <FloatingButton
        onPress={() => setModalVisible(true)}
        style={{ bottom: SPACING.md + 60 }}
      >
        {"+"}
      </FloatingButton>
      <ThemedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <SectionTitle>Select Exercise to Add</SectionTitle>
        <ScrollView style={{ maxHeight: 400 }}>
          {loadingExercises ? (
            <Text style={{ textAlign: "center", paddingVertical: SPACING.sm }}>
              Loading...
            </Text>
          ) : (
            exercises.map((exercise) => (
              <ListItem
                key={exercise.id}
                title={exercise.name}
                subtitle={exercise.muscleGroup}
                description={exercise.description}
                onPress={() => handleAddSection(exercise)}
                showRemove={false}
                style={{ backgroundColor: colors.cardList }}
              />
            ))
          )}
        </ScrollView>
      </ThemedModal>
      <SaveWorkoutButton
        style={{ marginBottom: SPACING.md }}
        exercises={sections.flatMap((section) =>
          section.sets.map((set) => ({
            exerciseId: section.exercise.id,
            reps: set.reps ? parseInt(set.reps, 10) : 0,
            weight: set.weight ? parseFloat(set.weight) : 0,
            notes: set.notes,
          }))
        )}
      />
    </ScreenContainer>
  );
}
