import RootLayout from "@/app/_layout";
import { SQLiteProvider } from "expo-sqlite";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { migrateDbIfNeeded } from "./db/database";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={["top", "bottom", "left", "right"]}
      >
        <SQLiteProvider databaseName="workout.db" onInit={migrateDbIfNeeded}>
          <RootLayout />
        </SQLiteProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
