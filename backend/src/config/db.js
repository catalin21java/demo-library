import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = sqlite3.verbose();

const dataDir = path.join(__dirname, "../../data");
const dbPath = path.join(dataDir, "app.sqlite");


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
    // Try to self-heal common local permission issues before failing hard.
    fs.chmodSync(dbPath, 0o644);
  }
}

const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (openError) => {
    if (openError) {
      console.error(`Failed to open SQLite database at ${dbPath}:`, openError.message);
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(
    `ALTER TABLE books ADD COLUMN rating INTEGER NOT NULL DEFAULT 0`,
    (alterError) => {
      if (
        alterError &&
        !String(alterError.message).toLowerCase().includes("duplicate column")
      ) {
        console.error("Failed to add rating column:", alterError.message);
      }
    },
  );
  db.run(
    `ALTER TABLE books ADD COLUMN is_favourite INTEGER NOT NULL DEFAULT 0`,
    (alterError) => {
      if (
        alterError &&
        !String(alterError.message).toLowerCase().includes("duplicate column")
      ) {
        console.error("Failed to add is_favourite column:", alterError.message);
      }
    },
  );
});

export default db;