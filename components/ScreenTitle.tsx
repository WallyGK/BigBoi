// components/ScreenTitle.tsx
import { FONT_SIZE, SPACING, ThemeContext } from "@/constants/Theme";
import { useContext } from "react";
import { Text } from "react-native";

export default function ScreenTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colors } = useContext(ThemeContext);
  return (
    <Text
      style={{
        fontSize: FONT_SIZE.xxl,
        fontWeight: "bold",
        color: colors.text,
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
        paddingHorizontal: SPACING.sm,
        backgroundColor: "transparent",
      }}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}
