import RootLayout from "@/app/_layout";
import { SQLiteProvider } from "expo-sqlite";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { migrateDbIfNeeded } from "./db/database";

export default function App() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="workout.db" onInit={migrateDbIfNeeded}>
        <RootLayout />
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
