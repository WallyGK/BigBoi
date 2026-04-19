import { getDb } from "@/db/index";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Share } from "react-native";

type ExportSummary = {
  fileUri: string;
  totalRows: number;
};

type SerializableRow = Record<string, string | number | null>;

function toCsvCell(value: unknown): string {
  if (value == null) {
    return "";
  }

  const raw = String(value);
  if (
    raw.includes(",") ||
    raw.includes("\n") ||
    raw.includes("\r") ||
    raw.includes('"')
  ) {
    return `"${raw.replace(/"/g, '""')}"`;
  }

  return raw;
}

function getPrimaryKey(table: string, row: SerializableRow): string {
  if (table === "template_exercises") {
    return `${row.template_id ?? ""}::${row.exercise_id ?? ""}::${row.set_order ?? ""}`;
  }

  return String(row.id ?? "");
}

export async function exportAllDataToCsv(): Promise<ExportSummary> {
  const db = await getDb();

  const datasets = await Promise.all([
    db.getAllAsync<SerializableRow>(
      `SELECT * FROM exercises ORDER BY name ASC, id ASC`,
    ),
    db.getAllAsync<SerializableRow>(
      `SELECT * FROM templates ORDER BY name ASC, id ASC`,
    ),
    db.getAllAsync<SerializableRow>(
      `SELECT * FROM template_exercises ORDER BY template_id ASC, exercise_id ASC, set_order ASC`,
    ),
    db.getAllAsync<SerializableRow>(
      `SELECT * FROM workout_logs ORDER BY datetime ASC, id ASC`,
    ),
    db.getAllAsync<SerializableRow>(
      `SELECT * FROM workout_exercises ORDER BY workout_id ASC, id ASC`,
    ),
  ]);

  const rowsByTable: { table: string; rows: SerializableRow[] }[] = [
    { table: "exercises", rows: datasets[0] },
    { table: "templates", rows: datasets[1] },
    { table: "template_exercises", rows: datasets[2] },
    { table: "workout_logs", rows: datasets[3] },
    { table: "workout_exercises", rows: datasets[4] },
  ];

  const lines: string[] = [
    "record_type,table,primary_key,payload_json",
    [
      "meta",
      "",
      "",
      toCsvCell(
        JSON.stringify({
          schema: 1,
          exported_at: new Date().toISOString(),
          format: "bigboi_full_backup",
        }),
      ),
    ].join(","),
  ];

  let totalRows = 0;

  for (const { table, rows } of rowsByTable) {
    for (const row of rows) {
      totalRows += 1;
      lines.push(
        [
          "data",
          toCsvCell(table),
          toCsvCell(getPrimaryKey(table, row)),
          toCsvCell(JSON.stringify(row)),
        ].join(","),
      );
    }
  }

  const csv = lines.join("\n");
  const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

  if (!baseDir) {
    throw new Error("No writable directory available for CSV export.");
  }

  const timestamp = new Date().toISOString().replace(/[.:]/g, "-");
  const fileUri = `${baseDir}bigboi-backup-${timestamp}.csv`;

  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Export Full Backup CSV",
      UTI: "public.comma-separated-values-text",
    });
  } else {
    await Share.share({
      title: "BigBoi Full Backup CSV",
      message: csv,
    });
  }

  return { fileUri, totalRows };
}
