import ScreenContainer from "@/components/ScreenContainer";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { getWorkoutLogs } from "@/db/workoutLogs";
import { useContext, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function Performance() {
  const { colors } = useContext(ThemeContext);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkoutLogs().then((data) => {
      setLogs(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <ScreenContainer>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: SPACING.md,
          color: colors.text,
        }}
      >
        Workout Log Entries
      </Text>
      {loading ? (
        <Text style={{ color: colors.text }}>Loading...</Text>
      ) : logs.length === 0 ? (
        <Text style={{ color: colors.text }}>No workout logs found.</Text>
      ) : (
        <ScrollView horizontal={true} style={{ marginBottom: SPACING.md }}>
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
                style={{ width: 220, fontWeight: "bold", color: colors.text }}
              >
                Workout ID
              </Text>
            </View>
            {/* Table Rows */}
            {logs.map((log) => (
              <View
                key={log.id}
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 0.5,
                  borderColor: colors.border,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ width: 120, color: colors.text }}>
                  {log.datetime}
                </Text>
                <Text style={{ width: 220, color: colors.text }}>{log.id}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
