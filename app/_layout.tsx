// app/_layout.tsx
import { ThemeContext, ThemeProvider } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { colors, darkMode } = useContext(ThemeContext);
  return (
    <SafeAreaProvider>
      {/* Global background color overlay */}
      <SafeAreaView
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.background,
          zIndex: -1,
        }}
        edges={[]}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["bottom"]}
      >
        <StatusBar style={darkMode ? "light" : "dark"} />
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitle: "",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <TouchableOpacity
                style={{ marginLeft: 12 }}
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={colors.tabIconDefault}
                />
              </TouchableOpacity>
            ) : null,
        }}
        // Use a custom layout for all screens
        layout={AppLayout}
      />
    </ThemeProvider>
  );
}
