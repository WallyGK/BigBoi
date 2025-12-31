import {
  BORDER_RADIUS,
  SHADOW,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { useContext } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface FloatingButtonProps extends TouchableOpacityProps {
  style?: object;
}

export default function FloatingButton({
  style,
  ...props
}: FloatingButtonProps) {
  const { colors } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }, style]}
      {...props}
    />
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
    right: SPACING.xl,
    bottom: SPACING.xl,
    ...SHADOW.default,
  },
});
