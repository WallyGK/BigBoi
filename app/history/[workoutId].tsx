import Button from "@/components/Button";
import ListItem from "@/components/ListItem";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenTitle from "@/components/ScreenTitle";
import SectionTitle from "@/components/SectionTitle";
import ThemedModal from "@/components/ThemedModal";
import ThemedTextInput from "@/components/ThemedTextInput";
import { toLocalDateKey } from "@/constants/date";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { addExerciseToTemplate, addTemplate } from "@/db/templates";
import { getWorkoutExercisesWithNames } from "@/db/workoutLogs";
import { type WorkoutExerciseDetail } from "@/types";
import { useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

export default function WorkoutHistoryDetailScreen() {
  const { colors } = useContext(ThemeContext);
  const { workoutId } = useLocalSearchParams<{ workoutId?: string }>();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WorkoutExerciseDetail[]>([]);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

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

  const groupedEntries = useMemo(() => {
    const groups = new Map<
      string,
      {
        exerciseId: string;
        exerciseName: string;
        sets: WorkoutExerciseDetail[];
      }
    >();

    for (const entry of entries) {
      const existing = groups.get(entry.exercise_id);
      if (existing) {
        existing.sets.push(entry);
      } else {
        groups.set(entry.exercise_id, {
          exerciseId: entry.exercise_id,
          exerciseName: entry.exercise_name,
          sets: [entry],
        });
      }
    }

    return Array.from(groups.values());
  }, [entries]);

  const openSaveTemplateModal = () => {
    const defaultName = summary.dateText
      ? `Workout ${summary.dateText}`
      : "Workout Template";
    setTemplateName(defaultName);
    setSaveModalVisible(true);
  };

  const handleSaveAsTemplate = async () => {
    const trimmedName = templateName.trim();
    if (!trimmedName) {
      Alert.alert("Template Name Required", "Please provide a template name.");
      return;
    }

    if (groupedEntries.length === 0) {
      Alert.alert(
        "No Exercises",
        "This workout has no exercise entries to save.",
      );
      return;
    }

    setSavingTemplate(true);
    try {
      const template = await addTemplate({
        name: trimmedName,
        description: summary.dateText
          ? `Saved from workout ${summary.dateText}`
          : "Saved from workout history",
        exercises: [],
      });

      if (!template) {
        throw new Error("Failed to create template");
      }

      for (const group of groupedEntries) {
        const firstSet = group.sets[0];
        const setEntries = group.sets.map((set) => ({
          reps: set.reps,
          weight: set.weight,
          notes: set.notes || "",
        }));

        await addExerciseToTemplate(
          template.id,
          group.exerciseId,
          group.sets.length,
          firstSet.reps,
          firstSet.weight,
          firstSet.notes || "",
          setEntries,
        );
      }

      setSaveModalVisible(false);
      Alert.alert(
        "Template Saved",
        `Saved \"${trimmedName}\" from this workout.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Save Failed", message);
    } finally {
      setSavingTemplate(false);
    }
  };

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

      {groupedEntries.length > 0 && (
        <Button
          title="Save as Template"
          onPress={openSaveTemplateModal}
          style={{ marginBottom: SPACING.md }}
        />
      )}

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: SPACING.lg }}
        />
      ) : groupedEntries.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>
          No exercise entries found.
        </Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: SPACING.md }}>
          {groupedEntries.map((group) => (
            <ListItem
              key={group.exerciseId}
              title={group.exerciseName}
              subtitle={`${group.sets.length} set${group.sets.length === 1 ? "" : "s"}`}
              showRemove={false}
              style={{ backgroundColor: colors.cardList }}
            >
              <View style={{ marginTop: SPACING.xs }}>
                {group.sets.map((set, index) => (
                  <Text key={set.id} style={{ color: colors.textSecondary }}>
                    Set {index + 1}: {set.reps} reps @ {set.weight} lb
                    {set.notes ? ` - ${set.notes}` : ""}
                  </Text>
                ))}
              </View>
            </ListItem>
          ))}
        </ScrollView>
      )}

      <ThemedModal
        visible={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
      >
        <SectionTitle>Save Workout as Template</SectionTitle>
        <ThemedTextInput
          placeholder="Template Name"
          value={templateName}
          onChangeText={setTemplateName}
          style={{ marginBottom: SPACING.md }}
        />
        <Button
          title={savingTemplate ? "Saving..." : "Save Template"}
          onPress={handleSaveAsTemplate}
          disabled={savingTemplate || !templateName.trim()}
        />
        <Button
          title="Cancel"
          onPress={() => setSaveModalVisible(false)}
          style={{ marginTop: SPACING.sm, backgroundColor: colors.error }}
        />
      </ThemedModal>
    </ScreenContainer>
  );
}
