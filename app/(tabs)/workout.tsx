// app/(tabs)/workout.tsx
import Button from "@/components/Button";
import Card from "@/components/Card";
import { ThemeContext } from "@/constants/ThemeContext";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function Workout() {
  const router = useRouter();
  const theme = useContext(ThemeContext);

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Card>
        <Button
          title="Start Workout"
          onPress={() => router.push("/start-workout")}
        />
      </Card>

      <Card>
        <Button
          title="Add/Edit Exercises"
          onPress={() => router.push("/exercises")}
        />
      </Card>

      <Card>
        <Button
          title="Add/Edit Templates"
          onPress={() => router.push("/templates")}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
