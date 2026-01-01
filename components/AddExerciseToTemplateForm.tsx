import Button from "@/components/Button";
import ListItem from "@/components/ListItem";
import SectionTitle from "@/components/SectionTitle";
import ThemedTextInput from "@/components/ThemedTextInput";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { Exercise } from "@/types";
import { useContext } from "react";
import { ScrollView, View } from "react-native";

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
        <ThemedTextInput
          placeholder="Sets"
          value={sets}
          onChangeText={setSets}
          keyboardType="numeric"
          style={{ marginBottom: SPACING.md }}
        />
        <ThemedTextInput
          placeholder="Reps"
          value={reps}
          onChangeText={setReps}
          keyboardType="numeric"
          style={{ marginBottom: SPACING.md }}
        />
        <ThemedTextInput
          placeholder="Weight (lb)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={{ marginBottom: SPACING.md }}
        />
        <ThemedTextInput
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          keyboardType="default"
          style={{ marginBottom: SPACING.md }}
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
