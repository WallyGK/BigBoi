// components/ConfirmDeleteModal.tsx
import Button from "@/components/Button";
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import { useContext } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

interface ConfirmDeleteModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export default function ConfirmDeleteModal({
  visible,
  onConfirm,
  onCancel,
  title = "Delete Item?",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
}: ConfirmDeleteModalProps) {
  const { colors } = useContext(ThemeContext);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.error }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
          <Button
            title="Delete"
            onPress={onConfirm}
            style={{ backgroundColor: colors.error, marginBottom: SPACING.sm }}
          />
          <Button title="Cancel" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: "stretch",
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
});
