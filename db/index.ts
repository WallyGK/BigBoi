// db/index.ts
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { migrateDbIfNeeded } from "./database";

// Singleton DB instance
let dbInstance: SQLiteDatabase | null = null;

/**
 * Get the shared SQLite database instance.
 * Ensures migration runs once on first access.
 */
export async function getDb(): Promise<SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  // Open (or create) the database
  dbInstance = await openDatabaseAsync("workout_v3.db");

  // Run migrations if needed
  await migrateDbIfNeeded(dbInstance);

  console.log("SQLite DB ready");

  return dbInstance;
}
