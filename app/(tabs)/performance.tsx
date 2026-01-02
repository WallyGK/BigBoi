import Button from "@/components/Button";
import ListItem from "@/components/ListItem";
import ScreenTitle from "@/components/ScreenTitle";
import SectionTitle from "@/components/SectionTitle";
import TabScreenContainer from "@/components/TabScreenContainer";
import ThemedModal from "@/components/ThemedModal";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { searchExercisesAsync } from "@/db/exercises";
import { getWorkoutExerciseEntries } from "@/db/workoutLogs";
import { useContext, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function Performance() {
  const { colors } = useContext(ThemeContext);
  const [entries, setEntries] = useState<any[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkoutExerciseEntries().then((data) => {
      setEntries(data || []);
      setLoading(false);
    });
  }, []);

  // Load exercises for filter modal
  useEffect(() => {
    if (filterModalVisible) {
      searchExercisesAsync("").then(setExercises);
    }
  }, [filterModalVisible]);

  // Filter entries when selectedExercise changes
  useEffect(() => {
    setLoading(true);
    getWorkoutExerciseEntries(selectedExercise?.name).then((data) => {
      setEntries(data || []);
      setLoading(false);
    });
  }, [selectedExercise]);

  return (
    <TabScreenContainer>
      <ScreenTitle>Workout Logs</ScreenTitle>
      {/* Table and loading state */}
      {loading ? (
        <Text style={{ color: colors.text }}>Loading...</Text>
      ) : entries.length === 0 ? (
        <Text style={{ color: colors.text }}>No workout logs found.</Text>
      ) : (
        <ScrollView horizontal={true} style={{ marginBottom: SPACING.sm }}>
          <View>
            {/* Table Header */}
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderColor: colors.border,
                paddingBottom: 4,
              }}
            >
              <Text
                style={{ width: 120, fontWeight: "bold", color: colors.text }}
              >
                Date
              </Text>
              <Text
                style={{ width: 160, fontWeight: "bold", color: colors.text }}
              >
                Exercise
              </Text>
              <Text
                style={{ width: 80, fontWeight: "bold", color: colors.text }}
              >
                Reps
              </Text>
              <Text
                style={{ width: 80, fontWeight: "bold", color: colors.text }}
              >
                Weight
              </Text>
              <Text
                style={{ width: 180, fontWeight: "bold", color: colors.text }}
              >
                Notes
              </Text>
            </View>
            {/* Table Rows */}
            {entries.map((entry: any, idx: number) => (
              <View
                key={entry.id || idx}
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 0.5,
                  borderColor: colors.border,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ width: 120, color: colors.text }}>
                  {entry.datetime}
                </Text>
                <Text style={{ width: 160, color: colors.text }}>
                  {entry.exercise_name}
                </Text>
                <Text style={{ width: 80, color: colors.text }}>
                  {entry.reps}
                </Text>
                <Text style={{ width: 80, color: colors.text }}>
                  {entry.weight}
                </Text>
                <Text style={{ width: 180, color: colors.text }}>
                  {entry.notes}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
      <Button
        title={selectedExercise ? `Filter: ${selectedExercise.name}` : "Filter"}
        onPress={() => setFilterModalVisible(true)}
        style={{ marginBottom: SPACING.sm }}
      />
      <ThemedModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      >
        <SectionTitle>Select Exercise to Filter</SectionTitle>
        <ScrollView style={{ maxHeight: 400 }}>
          {exercises.map((exercise) => (
            <ListItem
              key={exercise.id}
              title={exercise.name}
              subtitle={exercise.muscleGroup}
              description={exercise.description}
              onPress={() => {
                setSelectedExercise(exercise);
                setFilterModalVisible(false);
              }}
              showRemove={false}
              style={{ backgroundColor: colors.cardList }}
            />
          ))}
        </ScrollView>
        <Button
          title="Clear Filter"
          onPress={() => {
            setSelectedExercise(null);
            setFilterModalVisible(false);
          }}
          style={{ marginTop: SPACING.sm }}
        />
      </ThemedModal>
    </TabScreenContainer>
  );
}
