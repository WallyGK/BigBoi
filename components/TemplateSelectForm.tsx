import FloatingButton from "@/components/FloatingButton";
import ListItem from "@/components/ListItem";
import SectionTitle from "@/components/SectionTitle";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { useContext } from "react";
import { FlatList } from "react-native";

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
          <ListItem
            title={item.name}
            description={item.description}
            onPress={() => setSelectedTemplate(item)}
            style={[
              selectedTemplate?.id === item.id && {
                borderColor: colors.primary,
                borderWidth: 2,
              },
            ]}
            showRemove={false}
          />
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
