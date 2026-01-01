// components/ScreenTitle.tsx
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import { useContext } from "react";
import { Text, TextStyle } from "react-native";

interface ScreenTitleProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}

export default function ScreenTitle({ children, style }: ScreenTitleProps) {
  const { colors } = useContext(ThemeContext);
  return (
    <Text
      style={[
        {
          fontSize: FONT_SIZE.xxl,
          fontWeight: "bold",
          color: colors.text,
          paddingVertical: SPACING.sm,
          backgroundColor: "transparent",
        },
        style,
      ]}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}
