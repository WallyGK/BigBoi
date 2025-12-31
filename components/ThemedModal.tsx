// components/ThemedModal.tsx
import {
  BORDER_RADIUS,
  SHADOW,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ThemedModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function ThemedModal({
  visible,
  onClose,
  children,
  style,
}: ThemedModalProps) {
  const { colors } = useContext(ThemeContext);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.card },
            style,
          ]}
        >
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Modal content */}
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    borderRadius: BORDER_RADIUS.lg,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    maxHeight: "80%",
    ...SHADOW.default,
  },
  closeButton: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
