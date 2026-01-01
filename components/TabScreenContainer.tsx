// components/TabScreenContainer.tsx
import { ThemeContext } from "@/constants/Theme";
import { useContext } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabScreenContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colors } = useContext(ThemeContext);
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["left", "right", "top"]}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
