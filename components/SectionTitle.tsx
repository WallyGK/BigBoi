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
        fontSize: FONT_SIZE.lg,
        fontWeight: "600",
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
        color: colors.text,
        left: SPACING.sm,
      }}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}
