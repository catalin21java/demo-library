import db from "../config/db.js";

function mapBookRow(row) {
  if (!row) {
    return null;
  }
  const favouriteValue = row.isFavourite;
  const ratingValue = row.rating;
  const ratingNumber = ratingValue === undefined || ratingValue === null ? 0 : Number(ratingValue);
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    publishedYear: row.publishedYear,
    rating: Number.isInteger(ratingNumber) ? ratingNumber : 0,
    isFavourite: favouriteValue === 1 || favouriteValue === true,
    createdAt: row.createdAt,
  };
}

export function getAllBooks() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, title, author, published_year AS publishedYear, rating, is_favourite AS isFavourite, created_at AS createdAt FROM books ORDER BY id ASC",
      [],
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(rows.map(mapBookRow));
      }
    );
  });
}

export function getBookById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id, title, author, published_year AS publishedYear, rating, is_favourite AS isFavourite, created_at AS createdAt FROM books WHERE id = ?",
      [id],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(mapBookRow(row));
      }
    );
  });
}

export function createBook({ title, author, publishedYear }) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO books (title, author, published_year) VALUES (?, ?, ?)",
      [title, author, publishedYear],
      function onInsert(insertError) {
        if (insertError) {
          reject(insertError);
          return;
        }
        getBookById(this.lastID).then(resolve).catch(reject);
      },
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
  if (Object.prototype.hasOwnProperty.call(updates, "isFavourite")) {
    allowedFields.push("is_favourite = ?");
    values.push(updates.isFavourite ? 1 : 0);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "rating")) {
    allowedFields.push("rating = ?");
    values.push(updates.rating);
  }

  if (allowedFields.length === 0) {
    return Promise.reject(new Error("No fields to update."));
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
    db.run("DELETE FROM books WHERE id = ?", [id], function onDelete(deleteError) {
      if (deleteError) {
        reject(deleteError);
        return;
      }
      resolve(this.changes > 0);
    });
  });
}


