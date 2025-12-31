// app/(tabs)/workout.tsx
import Button from "@/components/Button";
import Card from "@/components/Card";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function Workout() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Card style={styles.card}>
        <Button
          title="Start Workout"
          onPress={() => router.push("/start-workout")}
        />
      </Card>

      <Card style={styles.card}>
        <Button
          title="Add/Edit Exercises"
          onPress={() => router.push("/exercises")}
        />
      </Card>

      <Card style={styles.card}>
        <Button
          title="Add/Edit Templates"
          onPress={() => router.push("/templates")}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    padding: SPACING.md,
  },
  card: {
    marginBottom: SPACING.sm,
  },
});
