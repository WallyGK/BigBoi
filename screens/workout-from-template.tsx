import FloatingButton from "@/components/FloatingButton";
import SectionTitle from "@/components/SectionTitle";
import ThemedModal from "@/components/ThemedModal";
import {
  BORDER_RADIUS,
  FONT_SIZE,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { searchTemplatesAsync } from "@/db/templates";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function WorkoutFromTemplateScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    (async () => {
      const allTemplates = await searchTemplatesAsync("");
      setTemplates(allTemplates);
    })();
  }, []);

  return (
    <ThemedModal
      visible={modalVisible}
      onClose={() => router.back()}
      style={{ justifyContent: "center" }}
    >
      <SectionTitle>Select a Template</SectionTitle>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.templateItem,
              selectedTemplate?.id === item.id && {
                borderColor: colors.primary,
                borderWidth: 2,
              },
            ]}
            onPress={() => setSelectedTemplate(item)}
            activeOpacity={0.7}
          >
            <Text
              style={{ color: colors.text, fontWeight: "600", fontSize: 18 }}
            >
              {item.name}
            </Text>
            {item.description ? (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: FONT_SIZE.sm,
                  marginTop: 2,
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.description}
              </Text>
            ) : null}
          </TouchableOpacity>
        )}
        style={{ maxHeight: 300 }}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <FloatingButton
        style={{
          position: "absolute",
          right: SPACING.sm,
          bottom: SPACING.sm,
          opacity: selectedTemplate ? 1 : 0.5,
        }}
        onPress={() => {
          if (selectedTemplate) {
            setModalVisible(false);
          }
        }}
        disabled={!selectedTemplate}
      >
        {"GO"}
      </FloatingButton>
    </ThemedModal>
  );
}

const styles = StyleSheet.create({
  templateItem: {
    width: "100%",
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
});
