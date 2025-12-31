// components/ExerciseListItem.tsx
import {
  BORDER_RADIUS,
  FONT_SIZE,
  SPACING,
  ThemeContext,
} from "@/constants/Theme";
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ListItem({
  title,
  subtitle,
  description,
  details,
  notes,
  onRemove,
  showRemove = true,
  onPress,
  children,
  style,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  details?: string;
  notes?: string;
  onRemove?: () => void;
  showRemove?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: any;
}) {
  const { colors } = useContext(ThemeContext);
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[styles.card, { backgroundColor: colors.card }, style]}
      {...(onPress ? { onPress } : {})}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={{ color: colors.textSecondary, fontSize: FONT_SIZE.sm }}>
            {subtitle}
          </Text>
        )}
        {description && (
          <Text
            style={{ color: colors.textSecondary, fontSize: FONT_SIZE.sm }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {description}
          </Text>
        )}
        {details && (
          <Text style={{ color: colors.textSecondary, fontSize: FONT_SIZE.sm }}>
            {details}
          </Text>
        )}
        {notes && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: FONT_SIZE.sm,
              marginTop: 2,
            }}
          >
            {notes}
          </Text>
        )}
        {children}
      </View>
      {showRemove && onRemove && (
        <TouchableOpacity onPress={onRemove}>
          <Text style={{ color: colors.error, fontWeight: "bold" }}>
            Remove
          </Text>
        </TouchableOpacity>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
  },
});
