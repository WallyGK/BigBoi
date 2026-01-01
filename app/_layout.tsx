// app/_layout.tsx
import { ThemeContext, ThemeProvider } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { TouchableOpacity, View } from "react-native";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { darkMode, colors } = useContext(ThemeContext);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      {children}
    </View>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  return (
    <ThemeProvider>
      <Stack
        screenOptions={({ route }) => ({
          headerShown: route.name !== "(tabs)",
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
        })}
        layout={AppLayout}
      />
    </ThemeProvider>
  );
}
