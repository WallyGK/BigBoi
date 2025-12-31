import TemplateSelectForm from "@/components/TemplateSelectForm";
import ThemedModal from "@/components/ThemedModal";
import { searchTemplatesAsync } from "@/db/templates";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function WorkoutFromTemplateScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

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
      <TemplateSelectForm
        templates={templates}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        onGo={() => {
          if (selectedTemplate) {
            setModalVisible(false);
          }
        }}
        goDisabled={!selectedTemplate}
      />
    </ThemedModal>
  );
}
