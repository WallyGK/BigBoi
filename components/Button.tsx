import {
  BORDER_RADIUS,
  FONT_SIZE,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: object;
}

export default function Button({
  title,
  onPress,
  disabled = false,
  style,
}: ButtonProps) {
  const { colors } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? colors.border : colors.primary,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: disabled ? colors.textSecondary : colors.text },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    textAlign: "center",
  },
});
