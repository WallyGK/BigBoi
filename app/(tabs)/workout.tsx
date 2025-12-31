// app/(tabs)/workout.tsx
import Button from "@/components/Button";
import Card from "@/components/Card";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenTitle from "@/components/ScreenTitle";
import { SPACING } from "@/constants/Theme";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

export default function Workout() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScreenTitle>Workout Options</ScreenTitle>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Card style={styles.card}>
          <Button
            title="Start Workout from Template"
            onPress={() => router.push("/workout-from-template")}
          />
        </Card>

        <Card style={styles.card}>
          <Button
            title="Start Free Workout"
            onPress={() => router.push("/workout-free")}
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.sm,
  },
});
