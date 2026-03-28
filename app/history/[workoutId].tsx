import ListItem from "@/components/ListItem";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenTitle from "@/components/ScreenTitle";
import { toLocalDateKey } from "@/constants/date";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { getWorkoutExercisesWithNames } from "@/db/workoutLogs";
import { type WorkoutExerciseDetail } from "@/types";
import { useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text } from "react-native";

export default function WorkoutHistoryDetailScreen() {
  const { colors } = useContext(ThemeContext);
  const { workoutId } = useLocalSearchParams<{ workoutId?: string }>();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WorkoutExerciseDetail[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      if (!workoutId) {
        if (isMounted) {
          setEntries([]);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getWorkoutExercisesWithNames(workoutId);
        if (isMounted) {
          setEntries(data);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDetails();

    return () => {
      isMounted = false;
    };
  }, [workoutId]);

  const summary = useMemo(() => {
    const totalWeight = entries.reduce(
      (sum, item) => sum + item.reps * item.weight,
      0,
    );
    const dateText =
      entries.length > 0 ? toLocalDateKey(entries[0].datetime) : "";
    return {
      totalWeight,
      dateText,
    };
  }, [entries]);

  return (
    <ScreenContainer>
      <ScreenTitle>Workout Details</ScreenTitle>

      {summary.dateText ? (
        <Text style={{ color: colors.textSecondary, marginBottom: SPACING.xs }}>
          Date: {summary.dateText}
        </Text>
      ) : null}

      <Text style={{ color: colors.textSecondary, marginBottom: SPACING.md }}>
        Total weight moved: {Math.round(summary.totalWeight)} lb
      </Text>

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: SPACING.lg }}
        />
      ) : entries.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>
          No exercise entries found.
        </Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: SPACING.md }}>
          {entries.map((entry) => (
            <ListItem
              key={entry.id}
              title={entry.exercise_name}
              subtitle={`${entry.reps} reps @ ${entry.weight} lb`}
              description={entry.notes || undefined}
              showRemove={false}
              style={{ backgroundColor: colors.cardList }}
            />
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
