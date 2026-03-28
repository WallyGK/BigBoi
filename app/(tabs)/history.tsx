import ListItem from "@/components/ListItem";
import ScreenTitle from "@/components/ScreenTitle";
import TabScreenContainer from "@/components/TabScreenContainer";
import { toLocalDateKey } from "@/constants/date";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { getWorkoutLogSummaries } from "@/db/workoutLogs";
import { type WorkoutLogSummary } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import { ActivityIndicator, FlatList, Text } from "react-native";

export default function HistoryScreen() {
  const { colors } = useContext(ThemeContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<WorkoutLogSummary[]>([]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWorkoutLogSummaries();
      setWorkouts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  return (
    <TabScreenContainer>
      <ScreenTitle>Workout History</ScreenTitle>

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: SPACING.lg }}
        />
      ) : workouts.length === 0 ? (
        <Text style={{ color: colors.textSecondary, marginTop: SPACING.md }}>
          No saved workouts yet.
        </Text>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: SPACING.md }}
          renderItem={({ item }) => (
            <ListItem
              title={toLocalDateKey(item.datetime) || item.datetime}
              subtitle={`${item.exercise_count} entries`}
              description={`Total weight moved: ${Math.round(item.total_weight)} lb`}
              onPress={() =>
                router.push({
                  pathname: "/history/[workoutId]",
                  params: { workoutId: item.id },
                })
              }
              showRemove={false}
              style={{ backgroundColor: colors.cardList }}
            />
          )}
        />
      )}
    </TabScreenContainer>
  );
}
