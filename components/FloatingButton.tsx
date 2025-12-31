import {
  BORDER_RADIUS,
  FONT_SIZE,
  SHADOW,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { useContext } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface FloatingButtonProps extends TouchableOpacityProps {
  style?: object;
  children?: React.ReactNode;
}

export default function FloatingButton({
  style,
  children,
  ...props
}: FloatingButtonProps) {
  const { colors } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }, style]}
      {...props}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={[styles.buttonText, { color: colors.text }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: SPACING.md,
    bottom: SPACING.xl,
    ...SHADOW.default,
  },
  buttonText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "600",
  },
});
