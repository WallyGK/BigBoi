import Button from "@/components/Button";
import ExerciseRow from "@/components/ExerciseRow";
import SectionTitle from "@/components/SectionTitle";
import SwipeDeleteRightAction from "@/components/SwipeDeleteRightAction";
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

export type ExerciseSetField = "reps" | "weight" | "notes";

export type ExerciseSetInput = {
  reps: string;
  weight: string;
  notes: string;
  done: boolean;
};

type ExerciseSetSectionProps = {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSetInput[];
  onChangeSet: (setIdx: number, field: ExerciseSetField, value: string) => void;
  onToggleSetDone: (setIdx: number) => void;
  onOpenNotes: (setIdx: number) => void;
  onRequestDeleteSet: (setIdx: number) => void;
  onAddSet: () => void;
  onRemoveExercise?: () => void;
  stickyNote?: string;
  onEditStickyNote?: () => void;
};

export default function ExerciseSetSection({
  exerciseId,
  exerciseName,
  sets,
  onChangeSet,
  onToggleSetDone,
  onOpenNotes,
  onRequestDeleteSet,
  onAddSet,
  onRemoveExercise,
  stickyNote,
  onEditStickyNote,
}: ExerciseSetSectionProps) {
  const { colors } = useContext(ThemeContext);

  return (
    <View
      style={{
        marginBottom: SPACING.md,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: SPACING.sm,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: SPACING.sm,
        }}
      >
        <SectionTitle style={{ fontSize: FONT_SIZE.lg }}>
          {exerciseName}
        </SectionTitle>
        {onRemoveExercise ? (
          <>
            <View style={{ flex: 1 }} />
            <Pressable onPress={onRemoveExercise}>
              <Ionicons name="trash-outline" size={24} color={colors.error} />
            </Pressable>
          </>
        ) : null}
      </View>
      {onEditStickyNote ? (
        <Pressable
          onPress={onEditStickyNote}
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            backgroundColor: stickyNote?.trim()
              ? "rgba(255, 220, 80, 0.15)"
              : "transparent",
            borderWidth: 1,
            borderColor: stickyNote?.trim()
              ? "rgba(255, 220, 80, 0.5)"
              : colors.border,
            borderRadius: 6,
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.xs,
            marginBottom: SPACING.sm,
          }}
        >
          <Ionicons
            name="document-text-outline"
            size={15}
            color={stickyNote?.trim() ? "#c8a800" : colors.textSecondary}
            style={{ marginTop: 2, marginRight: 6 }}
          />
          <Text
            style={{
              flex: 1,
              fontSize: FONT_SIZE.sm,
              color: stickyNote?.trim() ? "#c8a800" : colors.textSecondary,
              fontStyle: stickyNote?.trim() ? "normal" : "italic",
            }}
          >
            {stickyNote?.trim() || "Add a sticky note…"}
          </Text>
          <Ionicons
            name="create-outline"
            size={14}
            color={colors.textSecondary}
            style={{ marginTop: 2, marginLeft: 4 }}
          />
        </Pressable>
      ) : null}
      {sets.map((set, setIdx) => (
        <ReanimatedSwipeable
          key={`${exerciseId}-set-${setIdx}`}
          overshootRight={false}
          renderRightActions={(progress) => (
            <SwipeDeleteRightAction
              progress={progress}
              onPress={() => onRequestDeleteSet(setIdx)}
              colors={{ error: colors.error, text: colors.text }}
            />
          )}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              opacity: set.done ? 0.45 : 1,
              backgroundColor: set.done ? colors.border : "transparent",
              borderRadius: 8,
              paddingHorizontal: SPACING.xs,
            }}
          >
            <View style={{ flex: 1 }}>
              <ExerciseRow
                setNumber={setIdx + 1}
                reps={set.reps}
                weight={set.weight}
                onChangeReps={(value) => onChangeSet(setIdx, "reps", value)}
                onChangeWeight={(value) => onChangeSet(setIdx, "weight", value)}
              />
            </View>
            <Button
              title="+"
              onPress={() => onOpenNotes(setIdx)}
              style={{
                width: 32,
                height: 32,
                marginLeft: SPACING.xs,
                marginBottom: SPACING.xs,
                paddingVertical: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: set.notes?.trim()
                  ? colors.secondary
                  : colors.primary,
              }}
            />
            <Button
              title="✓"
              onPress={() => onToggleSetDone(setIdx)}
              style={{
                width: 32,
                height: 32,
                marginLeft: SPACING.xs,
                marginBottom: SPACING.xs,
                paddingVertical: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: set.done ? colors.secondary : colors.cardList,
                borderWidth: 1,
                borderColor: set.done ? colors.secondary : colors.border,
              }}
            />
          </View>
        </ReanimatedSwipeable>
      ))}
      <Button
        title="Add Set"
        onPress={onAddSet}
        style={{
          width: "100%",
          height: 30,
          paddingVertical: 0,
          marginTop: SPACING.xs,
        }}
      />
    </View>
  );
}
