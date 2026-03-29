import inter from "@/assets/fonts/Inter-VariableFont_opsz,wght.ttf";
import Button from "@/components/Button";
import ListItem from "@/components/ListItem";
import ScreenTitle from "@/components/ScreenTitle";
import SectionTitle from "@/components/SectionTitle";
import TabScreenContainer from "@/components/TabScreenContainer";
import ThemedModal from "@/components/ThemedModal";
import { toLocalDateKey } from "@/constants/date";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { searchExercisesAsync } from "@/db/exercises";
import { getWorkoutExerciseEntries } from "@/db/workoutLogs";
import { type Exercise, type WorkoutExerciseEntry } from "@/types";
import { Circle, useFont } from "@shopify/react-native-skia";
import { useContext, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { CartesianChart, Line } from "victory-native";

type ChartPoint = {
  date: string;
  value: number;
};

function formatGraphDateLabel(dateKey: string): string {
  const parts = dateKey.split("-");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return dateKey;
}

export default function Performance() {
  const font = useFont(inter, 12);
  const [entries, setEntries] = useState<WorkoutExerciseEntry[]>([]);

  const { colors } = useContext(ThemeContext);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const filteredEntries = useMemo(() => {
    if (!selectedExercise) {
      return entries;
    }

    return entries.filter((entry) => entry.exercise_id === selectedExercise.id);
  }, [entries, selectedExercise]);

  const graphData = useMemo<ChartPoint[]>(() => {
    const grouped = filteredEntries.reduce<
      Record<string, WorkoutExerciseEntry[]>
    >((result, entry) => {
      const dateKey = toLocalDateKey(entry.datetime);
      if (!dateKey) {
        return result;
      }

      if (!result[dateKey]) {
        result[dateKey] = [];
      }

      result[dateKey].push(entry);
      return result;
    }, {});

    return Object.entries(grouped)
      .map(([date, dayEntries]) => {
        if (!selectedExercise) {
          return {
            date,
            value: dayEntries.reduce(
              (sum, entry) => sum + (entry.reps || 0) * (entry.weight || 0),
              0,
            ),
          };
        }

        return {
          date,
          value: dayEntries.reduce((max, entry) => {
            const estimate = (entry.weight || 0) * (1 + (entry.reps || 0) / 30);
            return Math.max(max, estimate);
          }, 0),
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEntries, selectedExercise]);

  const chartUpperBound = useMemo(() => {
    const maxValue = graphData.reduce(
      (currentMax, point) => Math.max(currentMax, point.value),
      0,
    );

    return Math.max(maxValue * 1.1, 1);
  }, [graphData]);

  useEffect(() => {
    let isMounted = true;

    const loadEntries = async () => {
      try {
        const data = await getWorkoutExerciseEntries();
        if (isMounted) {
          setEntries(data || []);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load exercises for filter modal
  useEffect(() => {
    if (filterModalVisible) {
      searchExercisesAsync("").then(setExercises);
    }
  }, [filterModalVisible]);

  return (
    <TabScreenContainer>
      <ScreenTitle>Performance</ScreenTitle>
      {/* Top half: Graph */}
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          marginBottom: SPACING.md,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            color: colors.text,
            marginBottom: 8,
          }}
        >
          {selectedExercise
            ? `Estimated 1RM for ${selectedExercise.name}`
            : "Total Weight Moved per Workout"}
        </Text>
        {graphData.length > 0 ? (
          <View style={{ flex: 1, width: "100%" }}>
            <CartesianChart
              data={graphData.map((point) => ({
                x: formatGraphDateLabel(point.date),
                y: point.value,
              }))}
              xKey="x"
              yKeys={["y"]}
              xAxis={{
                font,
                labelColor: colors.text,
                lineColor: colors.border,
                tickCount: Math.min(graphData.length, 6),
              }}
              yAxis={[
                {
                  font,
                  labelColor: colors.text,
                  lineColor: colors.border,
                  domain: [0, chartUpperBound],
                },
              ]}
              frame={{ lineColor: colors.border, lineWidth: 1 }}
            >
              {({ points }) => (
                <>
                  <Line points={points.y} color="red" strokeWidth={3} />
                  {points.y.map((point, index) => (
                    <Circle
                      key={`point-${index}`}
                      cx={Number(point.x ?? 0)}
                      cy={Number(point.y ?? 0)}
                      r={4}
                      color="red"
                    />
                  ))}
                </>
              )}
            </CartesianChart>
          </View>
        ) : (
          <Text style={{ color: colors.text }}>No data to plot.</Text>
        )}
      </View>
      {/* Bottom half: Table */}
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        {loading ? (
          <Text style={{ color: colors.text }}>Loading...</Text>
        ) : filteredEntries.length === 0 ? (
          <Text style={{ color: colors.text }}>
            {selectedExercise
              ? "No workout logs found for selected exercise."
              : "No workout logs found."}
          </Text>
        ) : (
          <ScrollView
            style={{ marginBottom: SPACING.sm, maxHeight: 280 }}
            contentContainerStyle={{ paddingBottom: SPACING.xs }}
            nestedScrollEnabled
          >
            <ScrollView horizontal={true}>
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
                    style={{
                      width: 120,
                      fontWeight: "bold",
                      color: colors.text,
                    }}
                  >
                    Date
                  </Text>
                  <Text
                    style={{
                      width: 160,
                      fontWeight: "bold",
                      color: colors.text,
                    }}
                  >
                    Exercise
                  </Text>
                  <Text
                    style={{
                      width: 80,
                      fontWeight: "bold",
                      color: colors.text,
                    }}
                  >
                    Reps
                  </Text>
                  <Text
                    style={{
                      width: 80,
                      fontWeight: "bold",
                      color: colors.text,
                    }}
                  >
                    Weight
                  </Text>
                  <Text
                    style={{
                      width: 180,
                      fontWeight: "bold",
                      color: colors.text,
                    }}
                  >
                    Notes
                  </Text>
                </View>
                {/* Table Rows */}
                {filteredEntries.map((entry, idx) => (
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
                      {toLocalDateKey(entry.datetime) || entry.datetime}
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
          </ScrollView>
        )}
        <Button
          title={
            selectedExercise ? `Filter: ${selectedExercise.name}` : "Filter"
          }
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
            disabled={!selectedExercise}
            style={{ marginTop: SPACING.sm }}
          />
        </ThemedModal>
      </View>
    </TabScreenContainer>
  );
}
