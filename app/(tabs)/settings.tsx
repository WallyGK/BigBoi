import Button from "@/components/Button";
import ScreenTitle from "@/components/ScreenTitle";
import TabScreenContainer from "@/components/TabScreenContainer";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { resetAndSeedStrongData } from "@/db/seed/resetAndSeedStrong";
import { useContext, useState } from "react";
import { Alert, Text, View } from "react-native";

export default function Settings() {
  const { colors } = useContext(ThemeContext);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleResetAndSeed = () => {
    Alert.alert(
      "Reset and Import Data",
      "This will delete all current app data and import workouts from your Strong CSV seed. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          style: "destructive",
          onPress: async () => {
            setIsSeeding(true);
            try {
              const result = await resetAndSeedStrongData();
              Alert.alert(
                "Import Complete",
                `Imported ${result.workoutsImported} workouts, ${result.setsImported} sets, and ${result.exercisesImported} exercises.`,
              );
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Unknown error";
              Alert.alert("Import Failed", message);
            } finally {
              setIsSeeding(false);
            }
          },
        },
      ],
    );
  };

  return (
    <TabScreenContainer>
      <ScreenTitle>Settings</ScreenTitle>
      <View
        style={{
          marginTop: SPACING.sm,
          padding: SPACING.md,
          borderRadius: 12,
          backgroundColor: colors.card,
        }}
      >
        <Text style={{ color: colors.text, marginBottom: SPACING.sm }}>
          Data Tools
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: SPACING.md }}>
          Clears all app data stored in Expo Go for this project, then imports
          workouts from your provided Strong CSV seed.
        </Text>
        <Button
          title={isSeeding ? "Importing..." : "Reset + Import Seed Workouts"}
          onPress={handleResetAndSeed}
          disabled={isSeeding}
          style={{ backgroundColor: colors.error }}
        />
      </View>
    </TabScreenContainer>
  );
}
