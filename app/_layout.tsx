import { DarkColors, LightColors } from "@/constants/Colors";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const Colors = colorScheme === "dark" ? DarkColors : LightColors;

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: Colors.background }]}
        edges={["top"]}
      >
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Slot />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
