import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import React, { useContext } from "react";
import { StyleSheet, Text } from "react-native";

interface ErrorMessageProps {
  message?: string;
  style?: object;
}

export default function ErrorMessage({ message, style }: ErrorMessageProps) {
  const { colors } = useContext(ThemeContext);
  if (!message) return null;
  return (
    <Text
      style={[styles.text, { color: colors.error, textAlign: "center" }, style]}
      accessibilityRole="alert"
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    marginVertical: SPACING.xs,
    fontSize: FONT_SIZE.md,
    fontWeight: "500",
  },
});
