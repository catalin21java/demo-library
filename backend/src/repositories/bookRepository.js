import db from "../config/db.js";


export function getAllBooks() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, title, author, published_year AS publishedYear, created_at AS createdAt FROM books ORDER BY id ASC",
      [],
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(rows);
      }
    );
  });
}

export function getBookById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id, title, author, published_year AS publishedYear, created_at AS createdAt FROM books WHERE id = ?",
      [id],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(row || null);
      }
    );
  });
}

export function createBook({ title, author, publishedYear }) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT CASE
        WHEN NOT EXISTS (SELECT 1 FROM books WHERE id = 1) THEN 1
        ELSE (
          SELECT MIN(b1.id) + 1
          FROM books b1
          LEFT JOIN books b2 ON b1.id + 1 = b2.id
          WHERE b2.id IS NULL
        )
      END AS nextId
      `,
      [],
      (nextIdError, row) => {
        if (nextIdError) {
          reject(nextIdError);
          return;
        }

        const nextId = row?.nextId;
        db.run(
          "INSERT INTO books (id, title, author, published_year) VALUES (?, ?, ?, ?)",
          [nextId, title, author, publishedYear],
          function onInsert(insertError) {
            if (insertError) {
              reject(insertError);
              return;
            }
            getBookById(nextId).then(resolve).catch(reject);
          }
        );
      }
    );
  });
}

export function updateBook(id, updates) {
  const allowedFields = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(updates, "title")) {
    allowedFields.push("title = ?");
    values.push(updates.title);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "author")) {
    allowedFields.push("author = ?");
    values.push(updates.author);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "publishedYear")) {
    allowedFields.push("published_year = ?");
    values.push(updates.publishedYear);
  }

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE books SET ${allowedFields.join(", ")} WHERE id = ?`,
      [...values, id],
      function onUpdate(error) {
        if (error) {
          reject(error);
          return;
        }
        if (this.changes === 0) {
          resolve(null);
          return;
        }
        getBookById(id).then(resolve).catch(reject);
      }
    );
  });
}

export function deleteBook(id) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.run("DELETE FROM books WHERE id = ?", [id], function onDelete(deleteError) {
        if (deleteError) {
          db.run("ROLLBACK");
          reject(deleteError);
          return;
        }

        if (this.changes === 0) {
          db.run("ROLLBACK");
          resolve(false);
          return;
        }

        db.run(
          "UPDATE books SET id = id - 1 WHERE id > ?",
          [id],
          function onReindex(updateError) {
            if (updateError) {
              db.run("ROLLBACK");
              reject(updateError);
              return;
            }

            db.run("COMMIT", (commitError) => {
              if (commitError) {
                db.run("ROLLBACK");
                reject(commitError);
                return;
              }
              resolve(true);
            });
          }
        );
      });
    });
  });
}


