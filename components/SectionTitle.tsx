// components/SectionTitle.tsx
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import { useContext } from "react";
import { Text } from "react-native";

export default function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colors } = useContext(ThemeContext);
  return (
    <Text
      style={{
        fontSize: FONT_SIZE.xl,
        fontWeight: "600",
        paddingVertical: SPACING.sm,
        color: colors.text,
      }}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}
