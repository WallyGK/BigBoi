// components/ExerciseListItem.tsx
import {
  BORDER_RADIUS,
  FONT_SIZE,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ExerciseListItem({
  exercise,
  reps,
  sets,
  weight,
  onRemove,
  showRemove = true,
  onPress,
  displayMode = "full",
}: {
  exercise: { name: string; muscleGroup?: string; description?: string };
  reps?: string;
  sets?: string;
  weight?: string;
  onRemove?: () => void;
  showRemove?: boolean;
  onPress?: () => void;
  displayMode?: "name" | "full";
}) {
  const { colors } = useContext(ThemeContext);
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[styles.card, { backgroundColor: colors.card }]}
      {...(onPress ? { onPress } : {})}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: colors.text }]}>
          {exercise.name}
        </Text>
        {displayMode === "full" && (
          <>
            {exercise.muscleGroup && (
              <Text
                style={{ color: colors.textSecondary, fontSize: FONT_SIZE.sm }}
              >
                {exercise.muscleGroup}
              </Text>
            )}
            {exercise.description && (
              <Text
                style={{ color: colors.textSecondary, fontSize: FONT_SIZE.sm }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {exercise.description}
              </Text>
            )}
          </>
        )}
        {(reps || sets || weight) && (
          <Text style={{ color: colors.textSecondary, fontSize: FONT_SIZE.sm }}>
            {reps} reps x {sets} sets @ {weight}kg
          </Text>
        )}
      </View>
      {showRemove && onRemove && (
        <TouchableOpacity onPress={onRemove}>
          <Text style={{ color: colors.error, fontWeight: "bold" }}>
            Remove
          </Text>
        </TouchableOpacity>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
  },
});
