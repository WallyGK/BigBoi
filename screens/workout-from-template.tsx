import Button from "@/components/Button";
import TemplateSelectForm from "@/components/TemplateSelectForm";
import ThemedModal from "@/components/ThemedModal";
import { getExercisesForTemplate, searchTemplatesAsync } from "@/db/templates";
import { Alert, ScrollView, Text, View } from "react-native";

import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";

import ExerciseRow from "@/components/ExerciseRow";
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WorkoutFromTemplate() {
  const [modalVisible, setModalVisible] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [workoutSets, setWorkoutSets] = useState<any[]>([]);
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  // Placeholder for saving workout logs
  const saveWorkoutLogs = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert("Workout Saved", "Your workout has been logged.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }, 800);
  };
  const handleCompleteAndSave = () => {
    Alert.alert(
      "Save workout?",
      "Are you sure you want to save this workout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Save", onPress: saveWorkoutLogs },
      ]
    );
  };

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          <ScrollView
            contentContainerStyle={{ padding: SPACING.md, paddingBottom: 96 }}
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
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: FONT_SIZE.xl,
                      color: colors.text,
                      marginBottom: SPACING.sm,
                    }}
                  >
                    {exerciseName}
                  </Text>
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
          <View
            style={{
              paddingBottom: insets.bottom || SPACING.md,
            }}
          >
            <Button
              title={saving ? "Saving..." : "Complete & Save"}
              onPress={handleCompleteAndSave}
              disabled={saving}
            />
          </View>
        </View>
      )}
    </View>
  );
}
