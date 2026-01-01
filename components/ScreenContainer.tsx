// components/ScreenContainer.tsx
import { SPACING, ThemeContext } from "@/constants/Theme";
import { useContext } from "react";
import { View } from "react-native";

export default function ScreenContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colors } = useContext(ThemeContext);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: SPACING.sm,
      }}
    >
      {children}
    </View>
  );
}
