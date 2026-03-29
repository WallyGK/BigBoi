import ThemedTextInput from "@/components/ThemedTextInput";
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import React from "react";
import { Text, View } from "react-native";

interface ExerciseRowProps {
  setNumber: number;
  reps: string;
  weight: string;
  onChangeReps: (value: string) => void;
  onChangeWeight: (value: string) => void;
}

const ExerciseRow: React.FC<ExerciseRowProps> = ({
  setNumber,
  reps,
  weight,
  onChangeReps,
  onChangeWeight,
}) => {
  const { colors } = React.useContext(ThemeContext);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.xs,
        flexWrap: "wrap",
        gap: 6,
      }}
    >
      <Text
        style={{
          minWidth: 32,
          marginRight: 8,
          color: colors.text,
          fontSize: FONT_SIZE.lg,
        }}
      >{`Set ${setNumber}`}</Text>
      <ThemedTextInput
        value={reps}
        onChangeText={onChangeReps}
        keyboardType="numeric"
        placeholder="Reps"
        style={{
          width: 64,
          height: 32,
          textAlign: "center",
          paddingVertical: 2,
        }}
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
        placeholder="Weight"
        style={{
          width: 72,
          height: 32,
          textAlign: "center",
          paddingVertical: 2,
        }}
      />
    </View>
  );
};

export default ExerciseRow;
