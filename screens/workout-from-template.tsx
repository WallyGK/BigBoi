import SaveWorkoutButton from "@/components/SaveWorkoutButton";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenTitle from "@/components/ScreenTitle";
import TemplateSelectForm from "@/components/TemplateSelectForm";
import ThemedModal from "@/components/ThemedModal";
import { getExercisesForTemplate, searchTemplatesAsync } from "@/db/templates";
import { ScrollView, View } from "react-native";

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import ExerciseRow from "@/components/ExerciseRow";
import SectionTitle from "@/components/SectionTitle";
import { SPACING } from "@/constants/Theme";

export default function WorkoutFromTemplate() {
  const [modalVisible, setModalVisible] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [workoutSets, setWorkoutSets] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const allTemplates = await searchTemplatesAsync("");
      setTemplates(allTemplates);
    })();
  }, []);

  const handleGo = async () => {
    if (!selectedTemplate) return;
    let exercises = selectedTemplate.exercises;
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      try {
        exercises = await getExercisesForTemplate(selectedTemplate.id);
      } catch {
        exercises = [];
      }
    }
    const setsArr: any[] = [];
    (exercises || []).forEach((ex: any) => {
      for (let i = 0; i < Number(ex.sets || 1); i++) {
        setsArr.push({
          exerciseName: ex.exercise?.name || ex.name,
          set: i + 1,
          reps: ex.reps?.toString() || "",
          weight: ex.weight?.toString() || "",
        });
      }
    });
    setWorkoutSets(setsArr);
    setModalVisible(false);
  };

  const handleSetChange = (
    idx: number,
    field: "reps" | "weight" | "notes",
    value: string
  ) => {
    setWorkoutSets((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  return (
    <ScreenContainer>
      <ThemedModal
        visible={modalVisible}
        onClose={() => router.back()}
        style={{ justifyContent: "center" }}
      >
        <TemplateSelectForm
          templates={templates}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          onGo={handleGo}
          goDisabled={!selectedTemplate}
        />
      </ThemedModal>
      {!modalVisible && (
        <View style={{ flex: 1 }}>
          <ScreenTitle>Workout from Template</ScreenTitle>
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 96,
            }}
          >
            {/* Group workoutSets by exerciseName */}
            {(() => {
              const groups: {
                [exerciseName: string]: { idx: number; set: any }[];
              } = {};
              workoutSets.forEach((set, idx) => {
                if (!groups[set.exerciseName]) groups[set.exerciseName] = [];
                groups[set.exerciseName].push({ idx, set });
              });
              return Object.entries(groups).map(([exerciseName, sets]) => (
                <View key={exerciseName} style={{ marginBottom: SPACING.lg }}>
                  <SectionTitle>{exerciseName}</SectionTitle>
                  {sets.map(({ idx, set }) => (
                    <ExerciseRow
                      key={idx}
                      setNumber={set.set}
                      reps={set.reps}
                      weight={set.weight}
                      notes={set.notes}
                      onChangeReps={(v) => handleSetChange(idx, "reps", v)}
                      onChangeWeight={(v) => handleSetChange(idx, "weight", v)}
                      onChangeNotes={(v) => handleSetChange(idx, "notes", v)}
                    />
                  ))}
                </View>
              ));
            })()}
          </ScrollView>
          <SaveWorkoutButton
            style={{
              marginBottom: SPACING.md,
              marginHorizontal: SPACING.md,
            }}
            exercises={workoutSets.map((set) => ({
              exerciseId:
                set.exerciseId || set.exercise_id || set.exerciseName || "",
              reps: set.reps ? parseInt(set.reps, 10) : 0,
              weight: set.weight ? parseFloat(set.weight) : 0,
              notes: set.notes,
            }))}
          />
        </View>
      )}
    </ScreenContainer>
  );
}
