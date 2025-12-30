import { ThemeContext } from "@/constants/ThemeContext";
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: object;
}

export default function Button({ title, onPress, style }: ButtonProps) {
  const theme = useContext(ThemeContext);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { backgroundColor: theme.primary }, style]}
    >
      <Text style={[styles.text, { color: theme.background }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
