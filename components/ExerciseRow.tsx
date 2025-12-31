import {
  BORDER_RADIUS,
  FONT_SIZE,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import React from "react";
import { Text, TextInput, View } from "react-native";

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
          color: colors.textSecondary,
          paddingRight: SPACING.md,
          fontSize: FONT_SIZE.lg,
        }}
      >
        Set {setNumber}
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: BORDER_RADIUS.md,
          paddingVertical: 4,
          minWidth: 32,
          backgroundColor: colors.card,
          color: colors.text,
          fontSize: FONT_SIZE.lg,
          textAlign: "right",
        }}
        value={reps}
        onChangeText={onChangeReps}
        keyboardType="numeric"
        placeholder="Reps"
        placeholderTextColor={colors.textSecondary}
      />
      <Text
        style={{
          color: colors.text,
          fontSize: FONT_SIZE.lg,
        }}
      >
        x
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: BORDER_RADIUS.md,
          paddingHorizontal: SPACING.sm,
          paddingVertical: 4,
          minWidth: 48,
          backgroundColor: colors.card,
          color: colors.text,
          fontSize: FONT_SIZE.lg,
          textAlign: "right",
        }}
        value={weight}
        onChangeText={onChangeWeight}
        keyboardType="numeric"
        placeholder="Weight"
        placeholderTextColor={colors.textSecondary}
      />
      <Text
        style={{
          color: colors.text,
          fontSize: FONT_SIZE.lg,
          paddingRight: SPACING.md,
        }}
      >
        lb
      </Text>
      <TextInput
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: BORDER_RADIUS.md,
          paddingHorizontal: SPACING.sm,
          paddingVertical: 4,
          backgroundColor: colors.card,
          color: colors.text,
          fontSize: FONT_SIZE.lg,
          textAlign: "left",
        }}
        value={notes}
        onChangeText={onChangeNotes}
        keyboardType="default"
        placeholder="Notes"
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
};

export default ExerciseRow;
