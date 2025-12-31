// app/(tabs)/templates.tsx
import Card from "@/components/Card";
import { SHADOW, SPACING, ThemeContext } from "@/constants/Theme";
import { getExercisesForTemplate, searchTemplatesAsync } from "@/db/templates";
import { Template, TemplateExercise } from "@/types";
import { useContext, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RootStackParamList } from "@/types/navigation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type TemplatesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Templates"
>;

export default function Templates() {
  const { colors } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TemplatesScreenNavigationProp>();

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

  useEffect(() => {
    loadTemplates();
  }, []);

  const renderItem = ({ item }: { item: Template }) => {
    const exercises = templateExercises[item.id] || [];
    const preview = exercises.map((e) => e.name).join(", ");

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("EditTemplate", { templateId: item.id })
        }
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
      <TouchableOpacity
        style={[
          styles.addButton,
          {
            backgroundColor: colors.primary,
            bottom: SPACING.xl + insets.bottom,
          },
          SHADOW.default,
        ]}
        onPress={() => navigation.navigate("EditTemplate", {})}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.md },
  title: { fontSize: 20, fontWeight: "700", marginVertical: SPACING.md },
  name: { fontSize: 16, fontWeight: "600" },
  preview: { fontSize: 14, marginTop: SPACING.xs },
  addButton: {
    position: "absolute",
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
  },
});
