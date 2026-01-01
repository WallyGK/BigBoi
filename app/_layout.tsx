// app/_layout.tsx
import { ThemeContext, ThemeProvider } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { TouchableOpacity } from "react-native";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { darkMode } = useContext(ThemeContext);
  return (
    <>
      <StatusBar style={darkMode ? "light" : "dark"} />
      {children}
    </>
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
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="arrow-back"
                  size={32}
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
