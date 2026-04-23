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
    db.run(
      "INSERT INTO books (title, author, published_year) VALUES (?, ?, ?)",
      [title, author, publishedYear],
      function onInsert(error) {
        if (error) {
          reject(error);
          return;
        }
        getBookById(this.lastID).then(resolve).catch(reject);
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
    db.run("DELETE FROM books WHERE id = ?", [id], function onDelete(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve(this.changes > 0);
    });
  });
}


