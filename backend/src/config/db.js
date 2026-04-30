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

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      published_year INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
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