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

type TableMetric = "estimated1rm" | "totalWeightMoved" | "actualMaxWeight";

type DayMetricSet = {
  reps: number;
  weight: number;
};

type DaySummary = {
  date: string;
  totalWeight: number;
  bestEstimated1RM: {
    value: number;
    set: DayMetricSet;
  } | null;
  heaviestSet: DayMetricSet | null;
  topMuscleGroups: string;
};

type TableRow = {
  date: string;
  totalWeight?: string;
  estimated1RM?: string;
  heaviestRep?: string;
  templateName?: string;
  topMuscleGroups?: string;
};

const TABLE_COLUMN_WIDTH = 96;

function formatDisplayDate(dateKey: string): string {
  const parts = dateKey.split("-");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
  }
  return dateKey;
}

function formatChartDateLabel(dateKey: string): string {
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
  const [chartMetric, setChartMetric] =
    useState<TableMetric>("totalWeightMoved");
  const [chartMetricModalVisible, setChartMetricModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const availableChartMetrics = useMemo<TableMetric[]>(
    () =>
      selectedExercise
        ? ["totalWeightMoved", "actualMaxWeight", "estimated1rm"]
        : ["totalWeightMoved"],
    [selectedExercise],
  );

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
        if (chartMetric === "totalWeightMoved") {
          return {
            date,
            value: dayEntries.reduce(
              (sum, entry) => sum + (entry.reps || 0) * (entry.weight || 0),
              0,
            ),
          };
        }

        if (!selectedExercise) {
          return null;
        }

        if (chartMetric === "actualMaxWeight") {
          return {
            date,
            value: dayEntries.reduce(
              (max, entry) => Math.max(max, entry.weight || 0),
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
      .filter((point): point is ChartPoint => point !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [chartMetric, filteredEntries, selectedExercise]);

  const chartUpperBound = useMemo(() => {
    const maxValue = graphData.reduce(
      (currentMax, point) => Math.max(currentMax, point.value),
      0,
    );

    return Math.max(maxValue * 1.1, 1);
  }, [graphData]);

  const metricLabelByType: Record<TableMetric, string> = {
    estimated1rm: "Estimated 1RM",
    totalWeightMoved: "Total Weight",
    actualMaxWeight: "Actual Max Weight",
  };

  const metricLabel = metricLabelByType[chartMetric];

  useEffect(() => {
    if (!availableChartMetrics.includes(chartMetric)) {
      setChartMetric("totalWeightMoved");
    }
  }, [availableChartMetrics, chartMetric]);

  const daySummaries = useMemo<DaySummary[]>(() => {
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
        const totalWeight = dayEntries.reduce(
          (sum, entry) => sum + (entry.reps || 0) * (entry.weight || 0),
          0,
        );

        const bestEstimated1RM = dayEntries.reduce<
          DaySummary["bestEstimated1RM"]
        >((best, entry) => {
          const reps = entry.reps || 0;
          const weight = entry.weight || 0;
          const estimate = weight * (1 + reps / 30);

          if (!best || estimate > best.value) {
            return {
              value: estimate,
              set: {
                reps,
                weight,
              },
            };
          }

          return best;
        }, null);

        const heaviestSet = dayEntries.reduce<DayMetricSet | null>(
          (best, entry) => {
            const reps = entry.reps || 0;
            const weight = entry.weight || 0;

            if (!best) {
              return { reps, weight };
            }

            if (weight > best.weight) {
              return { reps, weight };
            }

            if (weight === best.weight && reps > best.reps) {
              return { reps, weight };
            }

            return best;
          },
          null,
        );

        const muscleGroupCounts = dayEntries.reduce<Record<string, number>>(
          (counts, entry) => {
            const group = (entry.muscle_group || "").trim();
            if (!group) {
              return counts;
            }
            counts[group] = (counts[group] || 0) + 1;
            return counts;
          },
          {},
        );

        const topMuscleGroups =
          Object.entries(muscleGroupCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([group]) => group)
            .join(", ") || "-";

        return {
          date,
          totalWeight,
          bestEstimated1RM,
          heaviestSet,
          topMuscleGroups,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredEntries]);

  const tableRows = useMemo<TableRow[]>(() => {
    return daySummaries.reduce<TableRow[]>((rows, summary) => {
      if (!selectedExercise) {
        rows.push({
          date: summary.date,
          totalWeight: Math.round(summary.totalWeight).toString(),
          templateName: "Custom",
          topMuscleGroups: summary.topMuscleGroups,
        });
        return rows;
      }

      rows.push({
        date: summary.date,
        totalWeight: Math.round(summary.totalWeight).toString(),
        estimated1RM: summary.bestEstimated1RM
          ? summary.bestEstimated1RM.value.toFixed(1)
          : "-",
        heaviestRep: summary.heaviestSet
          ? summary.heaviestSet.weight.toString()
          : "-",
      });

      return rows;
    }, []);
  }, [daySummaries, selectedExercise]);

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
            ? `${metricLabel} for ${selectedExercise.name}`
            : metricLabel === "Total Weight"
              ? "Total Weight Moved per Workout"
              : `${metricLabel} (select an exercise filter)`}
        </Text>
        <Button
          title={`Chart Metric: ${metricLabel}`}
          onPress={() => setChartMetricModalVisible(true)}
          style={{ marginBottom: SPACING.sm }}
        />
        {graphData.length > 0 ? (
          <View style={{ flex: 1, width: "100%" }}>
            <CartesianChart
              data={graphData.map((point) => ({
                x: formatChartDateLabel(point.date),
                y: point.value,
              }))}
              xKey="x"
              yKeys={["y"]}
              xAxis={{
                font,
                labelColor: colors.text,
                lineColor: colors.border,
                tickCount: Math.min(graphData.length, 6),
                formatXLabel: (v) => (v && v !== "undefined" ? v : ""),
              }}
              yAxis={[
                {
                  font,
                  labelColor: colors.text,
                  lineColor: colors.border,
                  domain: [0, chartUpperBound],
                  formatYLabel: (v) => {
                    if (chartMetric === "totalWeightMoved") {
                      const k = v / 1000;
                      return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
                    }
                    return String(v);
                  },
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
          <Text style={{ color: colors.text }}>
            {!selectedExercise && chartMetric !== "totalWeightMoved"
              ? "Select an exercise to plot this metric."
              : "No data to plot."}
          </Text>
        )}
      </View>
      {/* Bottom half: Table */}
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        {loading ? (
          <Text style={{ color: colors.text }}>Loading...</Text>
        ) : tableRows.length === 0 ? (
          <Text style={{ color: colors.text }}>
            {selectedExercise
              ? "No chart data found for selected exercise."
              : "No chart data found."}
          </Text>
        ) : (
          <ScrollView
            style={{ marginBottom: SPACING.sm, maxHeight: 280 }}
            contentContainerStyle={{ paddingBottom: SPACING.xs }}
            nestedScrollEnabled
          >
            <ScrollView horizontal>
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
                      width: TABLE_COLUMN_WIDTH,
                      fontWeight: "bold",
                      color: colors.text,
                      textAlign: "center",
                    }}
                  >
                    Date
                  </Text>
                  <Text
                    style={{
                      width: TABLE_COLUMN_WIDTH,
                      fontWeight: "bold",
                      color: colors.text,
                      textAlign: "center",
                    }}
                  >
                    Total Vol
                  </Text>
                  {selectedExercise ? (
                    <>
                      <Text
                        style={{
                          width: TABLE_COLUMN_WIDTH,
                          fontWeight: "bold",
                          color: colors.text,
                          textAlign: "center",
                        }}
                      >
                        Max Rep
                      </Text>
                      <Text
                        style={{
                          width: TABLE_COLUMN_WIDTH,
                          fontWeight: "bold",
                          color: colors.text,
                          textAlign: "center",
                        }}
                      >
                        Est 1RM
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text
                        style={{
                          width: TABLE_COLUMN_WIDTH,
                          fontWeight: "bold",
                          color: colors.text,
                          textAlign: "center",
                        }}
                      >
                        Template
                      </Text>
                      <Text
                        style={{
                          width: TABLE_COLUMN_WIDTH,
                          fontWeight: "bold",
                          color: colors.text,
                          textAlign: "center",
                        }}
                      >
                        Muscle Grp
                      </Text>
                    </>
                  )}
                </View>
                {/* Table Rows */}
                {tableRows.map((row, idx) => (
                  <View
                    key={`${row.date}-${idx}`}
                    style={{
                      flexDirection: "row",
                      borderBottomWidth: 0.5,
                      borderColor: colors.border,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        width: TABLE_COLUMN_WIDTH,
                        color: colors.text,
                        textAlign: "center",
                      }}
                    >
                      {formatDisplayDate(row.date)}
                    </Text>
                    <Text
                      style={{
                        width: TABLE_COLUMN_WIDTH,
                        color: colors.text,
                        textAlign: "center",
                      }}
                    >
                      {row.totalWeight}
                    </Text>
                    {selectedExercise ? (
                      <>
                        <Text
                          style={{
                            width: TABLE_COLUMN_WIDTH,
                            color: colors.text,
                            textAlign: "center",
                          }}
                        >
                          {row.heaviestRep || "-"}
                        </Text>
                        <Text
                          style={{
                            width: TABLE_COLUMN_WIDTH,
                            color: colors.text,
                            textAlign: "center",
                          }}
                        >
                          {row.estimated1RM || "-"}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={{
                            width: TABLE_COLUMN_WIDTH,
                            color: colors.text,
                            textAlign: "center",
                          }}
                        >
                          {row.templateName || "-"}
                        </Text>
                        <Text
                          style={{
                            width: TABLE_COLUMN_WIDTH,
                            color: colors.text,
                            textAlign: "center",
                          }}
                        >
                          {row.topMuscleGroups || "-"}
                        </Text>
                      </>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </ScrollView>
        )}
        <ThemedModal
          visible={chartMetricModalVisible}
          onClose={() => setChartMetricModalVisible(false)}
        >
          <SectionTitle>Select Chart Metric</SectionTitle>
          <ScrollView style={{ maxHeight: 280 }}>
            {availableChartMetrics.map((metric) => (
              <ListItem
                key={metric}
                title={metricLabelByType[metric]}
                subtitle={metric === chartMetric ? "Selected" : undefined}
                onPress={() => {
                  setChartMetric(metric);
                  setChartMetricModalVisible(false);
                }}
                showRemove={false}
                style={{ backgroundColor: colors.cardList }}
              />
            ))}
          </ScrollView>
        </ThemedModal>
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
