import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../../data");
const dbPath = path.join(dataDir, "app.sqlite");
const SEED_ADMIN_USERNAME = "admin";
const SEED_ADMIN_PASSWORD = "admin123";

function isDuplicateColumnError(error) {
  return Boolean(error && String(error.message).toLowerCase().includes("duplicate column"));
}

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve(this);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });
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

async function migrateToVersion1() {
  try {
    await runAsync(
      `ALTER TABLE books ADD COLUMN is_favourite INTEGER NOT NULL DEFAULT 0`,
    );
  } catch (alterError) {
    if (!isDuplicateColumnError(alterError)) {
      throw alterError;
    }
  }
  await runAsync("PRAGMA user_version = 1");
}

async function migrateToVersion2() {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','user','pending_admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS user_favourites (
      user_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, book_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  const adminRow = await getAsync(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'admin'",
  );
  const adminCount = Number(adminRow?.count ?? 0);

  if (adminCount === 0) {
    const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);
    await runAsync(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')",
      [SEED_ADMIN_USERNAME, passwordHash],
    );
    // eslint-disable-next-line no-console
    console.warn(
      `Seeded default admin account (username: ${SEED_ADMIN_USERNAME}). Change the password after first login.`,
    );
  }

  await runAsync("PRAGMA user_version = 2");
}

async function runMigrations() {
  await runAsync(`
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

  const versionRow = await getAsync("PRAGMA user_version");
  let version = Number(versionRow?.user_version ?? 0);

  if (version < 1) {
    await migrateToVersion1();
    version = 1;
  }

  if (version < 2) {
    await migrateToVersion2();
  }
}

db.serialize(() => {
  runMigrations().catch((migrationError) => {
    // eslint-disable-next-line no-console
    console.error("Database migration failed:", migrationError.message);
    process.exit(1);
  });
});

export default db;
