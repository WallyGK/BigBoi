import RootLayout from "@/app/_layout";
import { SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded } from "./db/database";

export default function App() {
  return (
    <SQLiteProvider databaseName="workout.db" onInit={migrateDbIfNeeded}>
      <RootLayout />
    </SQLiteProvider>
  );
}
