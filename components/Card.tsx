import {
  BORDER_RADIUS,
  SHADOW,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { useContext } from "react";
import { StyleSheet, View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: object;
}

export default function Card({ children, style }: CardProps) {
  const { colors } = useContext(ThemeContext);

  return (
    <View style={[styles.card, { backgroundColor: colors.card }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.xs,
    ...SHADOW.default,
  },
});
