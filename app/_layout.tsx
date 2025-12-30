// app/_layout.tsx
import { Colors } from "@/constants/Colors";
import { ThemeContext } from "@/constants/ThemeContext";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Appearance, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = Appearance.getColorScheme(); // 'light' | 'dark'
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={theme}>
      <SafeAreaProvider>
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background }]}
          edges={["top"]}
        >
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Slot />
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
