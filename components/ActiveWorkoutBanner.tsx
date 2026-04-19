import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import { useActiveWorkout } from "@/context/ActiveWorkoutContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";

export default function ActiveWorkoutBanner() {
  const { sections, mode, workoutTitle } = useActiveWorkout();
  const { colors } = useContext(ThemeContext);
  const router = useRouter();

  if (sections.length === 0) return null;

  const totalSets = sections.reduce((sum, s) => sum + s.sets.length, 0);
  const doneSets = sections.reduce(
    (sum, s) => sum + s.sets.filter((set) => set.done).length,
    0,
  );

  return (
    <Pressable
      onPress={() => router.push(`/WorkoutScreen?mode=${mode}`)}
      style={({ pressed }) => ({
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Ionicons
        name="barbell-outline"
        size={20}
        color="#fff"
        style={{ marginRight: SPACING.sm }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: FONT_SIZE.sm,
          }}
        >
          {workoutTitle}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
          {sections.length} exercise{sections.length !== 1 ? "s" : ""} ·{" "}
          {doneSets}/{totalSets} sets done
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#fff" />
    </Pressable>
  );
}
