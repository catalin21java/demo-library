import db from "../config/db.js";

function mapUserRow(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    createdAt: row.createdAt,
  };
}

export function findByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id, username, password_hash AS passwordHash, role, created_at AS createdAt
       FROM users WHERE username = ?`,
      [username],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(row || null);
      },
    );
  });
}

export function findById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id, username, role, created_at AS createdAt FROM users WHERE id = ?`,
      [id],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(mapUserRow(row));
      },
    );
  });
}

export function createUser({ username, passwordHash, role }) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
      [username, passwordHash, role],
      function onInsert(insertError) {
        if (insertError) {
          reject(insertError);
          return;
        }
        findById(this.lastID).then(resolve).catch(reject);
      },
    );
  });
}

export function listPendingAdmins() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, username, role, created_at AS createdAt
       FROM users WHERE role = 'pending_admin' ORDER BY created_at ASC`,
      [],
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(rows.map(mapUserRow));
      },
    );
  });
}

export function approveAdmin(id) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET role = 'admin' WHERE id = ? AND role = 'pending_admin'",
      [id],
      function onUpdate(updateError) {
        if (updateError) {
          reject(updateError);
          return;
        }
        if (this.changes === 0) {
          resolve(null);
          return;
        }
        findById(id).then(resolve).catch(reject);
      },
    );
  });
}

export function countAdmins() {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'admin'",
      [],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(Number(row?.count ?? 0));
      },
    );
  });
}
