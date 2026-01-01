import {
  BORDER_RADIUS,
  FONT_SIZE,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import React, { useContext } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

export default function ThemedTextInput(props: TextInputProps) {
  const { colors } = useContext(ThemeContext);
  return (
    <TextInput
      {...props}
      style={[
        styles.input,
        {
          color: colors.text,
          borderColor: colors.border,
          backgroundColor: colors.card,
        },
        props.style,
      ]}
      placeholderTextColor={colors.textSecondary}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
});
