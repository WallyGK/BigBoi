// app/(tabs)/workout.tsx
import Button from "@/components/Button";
import Card from "@/components/Card";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenTitle from "@/components/ScreenTitle";
import { useRouter } from "expo-router";

export default function Workout() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScreenTitle>Workout Options</ScreenTitle>
      <Card>
        <Button
          title="Start Workout from Template"
          onPress={() => router.push("/workout-from-template")}
        />
      </Card>

      <Card>
        <Button
          title="Start Free Workout"
          onPress={() => router.push("/workout-free")}
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
    </ScreenContainer>
  );
}
