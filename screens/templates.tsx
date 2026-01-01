// app/(tabs)/templates.tsx
import FloatingButton from "@/components/FloatingButton";
import ListItem from "@/components/ListItem";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenTitle from "@/components/ScreenTitle";
import { SHADOW, SPACING } from "@/constants/Theme";
import { getExercisesForTemplate, searchTemplatesAsync } from "@/db/templates";
import { Template, TemplateExercise } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList } from "react-native";

export default function Templates() {
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
      <ListItem
        title={item.name}
        subtitle={preview || "No exercises added yet"}
        onPress={() => router.push(`/EditTemplate?templateId=${item.id}`)}
      />
    );
  };

  return (
    <ScreenContainer>
      <ScreenTitle>Saved Templates:</ScreenTitle>

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
            bottom: SPACING.md,
          },
          SHADOW.default,
        ]}
        onPress={() => router.push("/EditTemplate")}
      >
        {"+"}
      </FloatingButton>
    </ScreenContainer>
  );
}
