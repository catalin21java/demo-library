import db from "../config/db.js";

export function listFavouriteBookIds(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT book_id AS bookId FROM user_favourites WHERE user_id = ? ORDER BY book_id ASC",
      [userId],
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(rows.map((row) => row.bookId));
      },
    );
  });
}

export function addFavourite(userId, bookId) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT OR IGNORE INTO user_favourites (user_id, book_id) VALUES (?, ?)",
      [userId, bookId],
      function onInsert(insertError) {
        if (insertError) {
          reject(insertError);
          return;
        }
        resolve(this.changes > 0);
      },
    );
  });
}

export function removeFavourite(userId, bookId) {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM user_favourites WHERE user_id = ? AND book_id = ?",
      [userId, bookId],
      function onDelete(deleteError) {
        if (deleteError) {
          reject(deleteError);
          return;
        }
        resolve(this.changes > 0);
      },
    );
  });
}
