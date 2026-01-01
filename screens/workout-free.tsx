import ExerciseRow from "@/components/ExerciseRow";
import FloatingButton from "@/components/FloatingButton";
import ListItem from "@/components/ListItem";
import SectionTitle from "@/components/SectionTitle";
import ThemedModal from "@/components/ThemedModal";
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import { searchExercisesAsync } from "@/db/exercises";
import { Exercise } from "@/types";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WorkoutFree() {
  const { colors } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const [sections, setSections] = useState<
    {
      exercise: Exercise;
      sets: { reps: string; weight: string; notes: string }[];
    }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  useEffect(() => {
    if (modalVisible) {
      setLoadingExercises(true);
      searchExercisesAsync("").then((data) => {
        setExercises(data);
        setLoadingExercises(false);
      });
    }
  }, [modalVisible]);

  const handleAddSection = (exercise: Exercise) => {
    setSections((prev) => [
      ...prev,
      { exercise, sets: [{ reps: "", weight: "", notes: "" }] },
    ]);
    setModalVisible(false);
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        {sections.map((section, sectionIdx) => (
          <View key={section.exercise.id}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: SPACING.sm,
              }}
            >
              <SectionTitle>{section.exercise.name}</SectionTitle>
              <FloatingButton
                style={{ width: 50, height: 40, bottom: 0, right: 0 }}
                onPress={() => handleAddSet(sectionIdx)}
                textStyle={{ fontSize: FONT_SIZE.md }}
              >
                {"Set +"}
              </FloatingButton>
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
        style={{
          bottom: insets.bottom + SPACING.xl,
        }}
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
            <Text style={{ textAlign: "center", padding: 20 }}>Loading...</Text>
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
    </View>
  );
}
