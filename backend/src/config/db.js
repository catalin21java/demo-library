import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../../data");
const dbPath = path.join(dataDir, "app.sqlite");

function isDuplicateColumnError(error) {
  return Boolean(error && String(error.message).toLowerCase().includes("duplicate column"));
}

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

try {
  fs.accessSync(dataDir, fs.constants.W_OK);
} catch {
  throw new Error(`Database directory is not writable: ${dataDir}`);
}

if (fs.existsSync(dbPath)) {
  try {
    fs.accessSync(dbPath, fs.constants.W_OK);
  } catch {
    throw new Error(`Database file is not writable: ${dbPath}`);
  }
}

const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (openError) => {
    if (openError) {
      // eslint-disable-next-line no-console
      console.error(`Failed to open SQLite database at ${dbPath}:`, openError.message);
      process.exit(1);
    }
  },
);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      published_year INTEGER,
      rating INTEGER NOT NULL DEFAULT 0,
      is_favourite INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.get("PRAGMA user_version", (pragmaError, row) => {
    if (pragmaError) {
      // eslint-disable-next-line no-console
      console.error("Failed to read schema version:", pragmaError.message);
      process.exit(1);
      return;
    }

    const version = Number(row?.user_version ?? 0);
    if (version >= 1) {
      return;
    }

    db.run(
      `ALTER TABLE books ADD COLUMN is_favourite INTEGER NOT NULL DEFAULT 0`,
      (alterError) => {
        if (alterError && !isDuplicateColumnError(alterError)) {
          // eslint-disable-next-line no-console
          console.error("Failed to migrate books table:", alterError.message);
          process.exit(1);
          return;
        }

        db.run("PRAGMA user_version = 1", (versionError) => {
          if (versionError) {
            // eslint-disable-next-line no-console
            console.error("Failed to set schema version:", versionError.message);
            process.exit(1);
          }
        });
      },
    );
  });
});

export default db;
