import { ThemeContext } from "@/constants/ThemeContext";
import { useContext } from "react";
import { StyleSheet, View } from "react-native";

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const theme = useContext(ThemeContext);

  return (
    <View style={[styles.card, { backgroundColor: theme.card }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
