import Button from "@/components/Button";
import ListItem from "@/components/ListItem";
import SectionTitle from "@/components/SectionTitle";
import { SPACING, ThemeContext } from "@/constants/Theme";
import { Template } from "@/types";
import { useContext } from "react";
import { ScrollView, Text } from "react-native";

interface TemplateSelectFormProps {
  templates: Template[];
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template) => void;
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
      <ScrollView style={{ maxHeight: 300, marginBottom: SPACING.md }}>
        {templates.length === 0 ? (
          <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
            No templates found.
          </Text>
        ) : (
          templates.map((item) => (
            <ListItem
              key={item.id}
              title={item.name}
              description={item.description}
              onPress={() => setSelectedTemplate(item)}
              style={[
                { backgroundColor: colors.cardList },
                selectedTemplate?.id === item.id && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
              showRemove={false}
            />
          ))
        )}
      </ScrollView>

      <Button title="Use Template" onPress={onGo} disabled={goDisabled} />
    </>
  );
}
