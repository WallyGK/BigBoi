// app/(tabs)/templates.tsx
import Card from "@/components/Card";
import FloatingButton from "@/components/FloatingButton";
import { FONT_SIZE, SHADOW, SPACING, ThemeContext } from "@/constants/Theme";
import { getExercisesForTemplate, searchTemplatesAsync } from "@/db/templates";
import { Template, TemplateExercise } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Templates() {
  const { colors } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateExercises, setTemplateExercises] = useState<
    Record<string, TemplateExercise[]>
  >({});

  const loadTemplates = async () => {
    const allTemplates = await searchTemplatesAsync("");
    setTemplates(allTemplates);

    const exercisesMap: Record<string, TemplateExercise[]> = {};
    for (const t of allTemplates) {
      exercisesMap[t.id] = await getExercisesForTemplate(t.id);
    }
    setTemplateExercises(exercisesMap);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTemplates();
    }, [])
  );

  const renderItem = ({ item }: { item: Template }) => {
    const exercises = templateExercises[item.id] || [];
    const preview = exercises.map((e) => e.name).join(", ");

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/EditTemplate?templateId=${item.id}`)}
      >
        <Card
          style={{ backgroundColor: colors.card, marginBottom: SPACING.sm }}
        >
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.preview, { color: colors.textSecondary }]}>
            {preview || "No exercises added yet"}
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Saved Templates:
      </Text>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: SPACING.md }}
      />

      {/* Floating Add Button */}
      <FloatingButton
        style={[
          {
            bottom: SPACING.xl + insets.bottom,
          },
          SHADOW.default,
        ]}
        onPress={() => router.push("/EditTemplate")}
      >
        {"+"}
      </FloatingButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.md },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    marginVertical: SPACING.sm,
  },
  name: { fontSize: FONT_SIZE.lg, fontWeight: "600" },
  preview: { fontSize: FONT_SIZE.md, marginTop: SPACING.xs },
});
