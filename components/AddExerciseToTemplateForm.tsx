import Button from "@/components/Button";
import ListItem from "@/components/ListItem";
import SectionTitle from "@/components/SectionTitle";
import {
  BORDER_RADIUS,
  FONT_SIZE,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { Exercise } from "@/types";
import { useContext } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";

interface AddExerciseToTemplateFormProps {
  allExercises: Exercise[];
  selectedExercise: Exercise | null;
  setSelectedExercise: (ex: Exercise | null) => void;
  reps: string;
  setReps: (v: string) => void;
  sets: string;
  setSets: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export default function AddExerciseToTemplateForm({
  allExercises,
  selectedExercise,
  setSelectedExercise,
  reps,
  setReps,
  sets,
  setSets,
  weight,
  setWeight,
  notes,
  setNotes,
  onAdd,
  onCancel,
}: AddExerciseToTemplateFormProps) {
  const { colors } = useContext(ThemeContext);
  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <SectionTitle>Add Exercise</SectionTitle>
      <View
        style={{ maxHeight: 180, marginBottom: SPACING.md, overflow: "hidden" }}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          {allExercises.map((item) => (
            <ListItem
              key={item.id}
              title={item.name}
              subtitle={item.muscleGroup}
              onPress={() => setSelectedExercise(item)}
              style={[
                { backgroundColor: colors.cardList },
                selectedExercise?.id === item.id && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
            />
          ))}
        </ScrollView>
      </View>
      <View>
        <TextInput
          placeholder="Sets"
          placeholderTextColor={colors.textSecondary}
          value={sets}
          onChangeText={setSets}
          keyboardType="numeric"
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        />
        <TextInput
          placeholder="Reps"
          placeholderTextColor={colors.textSecondary}
          value={reps}
          onChangeText={setReps}
          keyboardType="numeric"
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        />
        <TextInput
          placeholder="Weight (lb)"
          placeholderTextColor={colors.textSecondary}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        />
        <TextInput
          placeholder="Notes (optional)"
          placeholderTextColor={colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
          keyboardType="default"
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        />
        <Button
          title="Add to Template"
          onPress={onAdd}
          disabled={!selectedExercise || !reps || !sets}
          style={{ marginTop: SPACING.md }}
        />
        <Button
          title="Cancel"
          onPress={onCancel}
          style={{ marginTop: SPACING.sm, backgroundColor: colors.error }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
});
