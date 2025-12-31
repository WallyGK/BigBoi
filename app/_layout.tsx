// app/_layout.tsx
import { ThemeContext, ThemeProvider } from "@/constants/Theme";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

// Extracted content to use ThemeContext
function AppContent() {
  const { colors, darkMode } = useContext(ThemeContext);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <StatusBar style={darkMode ? "light" : "dark"} />
      <Slot />
    </SafeAreaView>
  );
}
