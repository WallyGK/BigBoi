// app/(tabs)/workout.tsx
import Button from "@/components/Button";
import Card from "@/components/Card";
import ScreenTitle from "@/components/ScreenTitle";
import TabScreenContainer from "@/components/TabScreenContainer";
import { SPACING } from "@/constants/Theme";
import { useRouter } from "expo-router";

export default function Workout() {
  const router = useRouter();

  return (
    <TabScreenContainer>
      <ScreenTitle style={{ paddingBottom: SPACING.md }}>
        Workout Options
      </ScreenTitle>
      <Card style={{ marginVertical: SPACING.sm }}>
        <Button
          title="Start Workout from Template"
          onPress={() => router.push("/workout-from-template")}
        />
      </Card>

      <Card style={{ marginVertical: SPACING.sm }}>
        <Button
          title="Start Free Workout"
          onPress={() => router.push("/workout-free")}
        />
      </Card>

      <Card style={{ marginVertical: SPACING.sm }}>
        <Button
          title="Add/Edit Exercises"
          onPress={() => router.push("/exercises")}
        />
      </Card>

      <Card style={{ marginVertical: SPACING.sm }}>
        <Button
          title="Add/Edit Templates"
          onPress={() => router.push("/templates")}
        />
      </Card>
    </TabScreenContainer>
  );
}
