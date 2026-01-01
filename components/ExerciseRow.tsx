import ThemedTextInput from "@/components/ThemedTextInput";
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import React from "react";
import { Text, View } from "react-native";

interface ExerciseRowProps {
  setNumber: number;
  reps: string;
  weight: string;
  notes: string;
  onChangeReps: (value: string) => void;
  onChangeWeight: (value: string) => void;
  onChangeNotes: (value: string) => void;
}

const ExerciseRow: React.FC<ExerciseRowProps> = ({
  setNumber,
  reps,
  weight,
  notes,
  onChangeReps,
  onChangeWeight,
  onChangeNotes,
}) => {
  const { colors } = React.useContext(ThemeContext);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.sm,
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <Text
        style={{
          minWidth: 32,
          marginRight: 8,
          color: colors.textSecondary,
          fontSize: FONT_SIZE.lg,
        }}
      >{`Set ${setNumber}`}</Text>
      <ThemedTextInput
        value={reps}
        onChangeText={onChangeReps}
        keyboardType="numeric"
        placeholder="Reps"
        style={{ minWidth: 32, textAlign: "right" }}
      />
      <Text
        style={{
          marginHorizontal: 4,
          color: colors.text,
          fontSize: FONT_SIZE.lg,
        }}
      >
        x
      </Text>
      <ThemedTextInput
        value={weight === "0" ? "" : weight}
        onChangeText={onChangeWeight}
        keyboardType="numeric"
        placeholder="##"
        style={{ minWidth: 48, textAlign: "right" }}
      />
      <ThemedTextInput
        value={notes}
        onChangeText={onChangeNotes}
        keyboardType="default"
        placeholder="Notes"
        style={{ flex: 1, textAlign: "left" }}
      />
    </View>
  );
};

export default ExerciseRow;
