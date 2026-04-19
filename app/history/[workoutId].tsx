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
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds <= 0) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  return `${s}s`;
}

function toCsvCell(value: unknown): string {
  if (value == null) return "";

  const raw = String(value);
  if (
    raw.includes(",") ||
    raw.includes("\n") ||
    raw.includes("\r") ||
    raw.includes('"')
  ) {
    return `"${raw.replace(/"/g, '""')}"`;
  }

  return raw;
}

function buildWorkoutCsv(entries: WorkoutExerciseDetail[]): string {
  const header = [
    "datetime",
    "duration_seconds",
    "exercise_name",
    "set_number",
    "reps",
    "weight_lb",
    "notes",
  ].join(",");

  const ordered = [...entries].sort(
    (a, b) => a.execution_order - b.execution_order,
  );

  const setCounterByExercise = new Map<string, number>();

  const lines = ordered.map((entry) => {
    const currentSet = (setCounterByExercise.get(entry.exercise_id) ?? 0) + 1;
    setCounterByExercise.set(entry.exercise_id, currentSet);

    return [
      toCsvCell(entry.datetime),
      toCsvCell(entry.duration_seconds ?? ""),
      toCsvCell(entry.exercise_name),
      toCsvCell(currentSet),
      toCsvCell(entry.reps),
      toCsvCell(entry.weight),
      toCsvCell(entry.notes ?? ""),
    ].join(",");
  });

  return [header, ...lines].join("\n");
}

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
    const durationText =
      entries.length > 0 ? formatDuration(entries[0].duration_seconds) : "-";
    const notes = Array.from(
      new Set(
        entries
          .map((item) => (item.notes || "").trim())
          .filter((note) => note.length > 0),
      ),
    );
    return {
      totalWeight,
      dateText,
      durationText,
      notes,
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

  const handleCopyWorkoutData = async () => {
    if (entries.length === 0) {
      Alert.alert("Nothing to Copy", "This workout has no sets to copy.");
      return;
    }

    const csv = buildWorkoutCsv(entries);
    await Clipboard.setStringAsync(csv);
    Alert.alert("Copied", "Workout data was copied to your clipboard.");
  };

  return (
    <ScreenContainer>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ScreenTitle>Workout Details</ScreenTitle>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy workout data"
          onPress={handleCopyWorkoutData}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: SPACING.xs,
            paddingHorizontal: SPACING.sm,
            borderRadius: 8,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons
            name="copy-outline"
            size={16}
            color={colors.text}
            style={{ marginRight: 6 }}
          />
          <Text style={{ color: colors.text, fontWeight: "600" }}>Copy</Text>
        </Pressable>
      </View>

      {summary.dateText ? (
        <Text style={{ color: colors.textSecondary, marginBottom: SPACING.xs }}>
          Date: {summary.dateText}
        </Text>
      ) : null}

      <Text style={{ color: colors.textSecondary, marginBottom: SPACING.md }}>
        Total weight moved: {Math.round(summary.totalWeight)} lb
      </Text>

      <Text style={{ color: colors.textSecondary, marginBottom: SPACING.md }}>
        Duration: {summary.durationText}
      </Text>

      {summary.notes.length > 0 ? (
        <Text style={{ color: colors.textSecondary, marginBottom: SPACING.md }}>
          Notes: {summary.notes.join(" | ")}
        </Text>
      ) : null}

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
