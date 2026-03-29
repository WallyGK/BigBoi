// components/SectionTitle.tsx
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import { useContext } from "react";
import { Text, type TextStyle } from "react-native";

export default function SectionTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle;
}) {
  const { colors } = useContext(ThemeContext);
  return (
    <Text
      style={[
        {
          fontSize: FONT_SIZE.xl,
          fontWeight: "600",
          paddingVertical: SPACING.sm,
          color: colors.text,
        },
        style,
      ]}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}
