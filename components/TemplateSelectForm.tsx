import FloatingButton from "@/components/FloatingButton";
import SectionTitle from "@/components/SectionTitle";
import {
  BORDER_RADIUS,
  FONT_SIZE,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { useContext } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";

interface TemplateSelectFormProps {
  templates: any[];
  selectedTemplate: any;
  setSelectedTemplate: (template: any) => void;
  onGo: () => void;
  goDisabled?: boolean;
}

export default function TemplateSelectForm({
  templates,
  selectedTemplate,
  setSelectedTemplate,
  onGo,
  goDisabled,
}: TemplateSelectFormProps) {
  const { colors } = useContext(ThemeContext);
  return (
    <>
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
          opacity: goDisabled ? 0.5 : 1,
          backgroundColor: colors.secondary,
        }}
        onPress={onGo}
        disabled={goDisabled}
      >
        {"GO"}
      </FloatingButton>
    </>
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
