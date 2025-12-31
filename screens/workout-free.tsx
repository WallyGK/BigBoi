import ExerciseRow from "@/components/ExerciseRow";
import FloatingButton from "@/components/FloatingButton";
import { SPACING, ThemeContext } from "@/constants/Theme";
import React, { useContext, useState } from "react";
import { ScrollView, View } from "react-native";

export default function WorkoutFree() {
  const { colors } = useContext(ThemeContext);
  const [sets, setSets] = useState<
    {
      reps: string;
      weight: string;
      notes: string;
    }[]
  >([]);

  const handleAddSet = () => {
    setSets((prev) => [...prev, { reps: "", weight: "", notes: "" }]);
  };

  const handleSetChange = (
    idx: number,
    field: "reps" | "weight" | "notes",
    value: string
  ) => {
    setSets((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        {sets.map((set, idx) => (
          <ExerciseRow
            key={idx}
            setNumber={idx + 1}
            reps={set.reps}
            weight={set.weight}
            notes={set.notes}
            onChangeReps={(v) => handleSetChange(idx, "reps", v)}
            onChangeWeight={(v) => handleSetChange(idx, "weight", v)}
            onChangeNotes={(v) => handleSetChange(idx, "notes", v)}
          />
        ))}
      </ScrollView>
      <FloatingButton
        onPress={handleAddSet}
        style={{ position: "absolute", right: SPACING.lg, bottom: SPACING.lg }}
      >
        {"+"}
      </FloatingButton>
    </View>
  );
}
