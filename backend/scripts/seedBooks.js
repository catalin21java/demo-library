import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../data");
const dbPath = path.join(dataDir, "app.sqlite");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/** @type {readonly [string, string, number][]} */
const BOOKS = [
  ["Pride and Prejudice", "Jane Austen", 1813],
  ["1984", "George Orwell", 1949],
  ["To Kill a Mockingbird", "Harper Lee", 1960],
  ["The Great Gatsby", "F. Scott Fitzgerald", 1925],
  ["One Hundred Years of Solitude", "Gabriel García Márquez", 1967],
  ["Crime and Punishment", "Fyodor Dostoevsky", 1866],
  ["The Catcher in the Rye", "J.D. Salinger", 1951],
  ["Lord of the Flies", "William Golding", 1954],
  ["Brave New World", "Aldous Huxley", 1932],
  ["Jane Eyre", "Charlotte Brontë", 1847],
  ["The Hobbit", "J.R.R. Tolkien", 1937],
  ["Fahrenheit 451", "Ray Bradbury", 1953],
  ["Moby-Dick", "Herman Melville", 1851],
  ["War and Peace", "Leo Tolstoy", 1869],
  ["Anna Karenina", "Leo Tolstoy", 1878],
  ["The Odyssey", "Homer (Emily Wilson trans.)", 2017],
  ["Beloved", "Toni Morrison", 1987],
  ["The Brothers Karamazov", "Fyodor Dostoevsky", 1880],
  ["Invisible Man", "Ralph Ellison", 1952],
  ["Slaughterhouse-Five", "Kurt Vonnegut", 1969],
  ["Middlemarch", "George Eliot", 1871],
  ["Things Fall Apart", "Chinua Achebe", 1958],
  ["The Grapes of Wrath", "John Steinbeck", 1939],
  ["The Stranger", "Albert Camus", 1942],
  ["The Road", "Cormac McCarthy", 2006],
  ["A Brief History of Time", "Stephen Hawking", 1988],
  ["Sapiens", "Yuval Noah Harari", 2011],
  ["The Sixth Extinction", "Elizabeth Kolbert", 2014],
  ["Educated", "Tara Westover", 2018],
  ["The Immortal Life of Henrietta Lacks", "Rebecca Skloot", 2010],
  ["Thinking, Fast and Slow", "Daniel Kahneman", 2011],
  ["The Emperor of All Maladies", "Siddhartha Mukherjee", 2010],
  ["Guns, Germs, and Steel", "Jared Diamond", 1997],
  ["The Warmth of Other Suns", "Isabel Wilkerson", 2010],
  ["Quiet", "Susan Cain", 2012],
  ["The Wright Brothers", "David McCullough", 2015],
  ["Becoming", "Michelle Obama", 2018],
  ["The Silk Roads", "Peter Frankopan", 2015],
  ["Circe", "Madeline Miller", 2018],
  ["The Song of Achilles", "Madeline Miller", 2011],
  ["Wolf Hall", "Hilary Mantel", 2009],
  ["Never Let Me Go", "Kazuo Ishiguro", 2005],
  ["Norwegian Wood", "Haruki Murakami", 1987],
  ["The Wind-Up Bird Chronicle", "Haruki Murakami", 1994],
  ["The Underground Railroad", "Colson Whitehead", 2016],
  ["Klara and the Sun", "Kazuo Ishiguro", 2021],
  ["The Nickel Boys", "Colson Whitehead", 2019],
  ["Piranesi", "Susanna Clarke", 2020],
  ["The Overstory", "Richard Powers", 2018],
  ["A Visit from the Goon Squad", "Jennifer Egan", 2010],
];

const sqlite = sqlite3.verbose();
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

  db.run("BEGIN IMMEDIATE TRANSACTION");

  db.run("DELETE FROM books");
  db.run("DELETE FROM sqlite_sequence WHERE name = 'books'");

  const stmt = db.prepare("INSERT INTO books (title, author, published_year) VALUES (?, ?, ?)");

  for (const row of BOOKS) {
    stmt.run(row);
  }

  stmt.finalize();

  db.run("COMMIT", (commitError) => {
    if (commitError) {
      console.error(commitError);
      process.exit(1);
      return;
    }
    console.log(`Seeded ${BOOKS.length} books into ${dbPath}`);
    db.close((closeError) => {
      if (closeError) {
        console.error(closeError);
        process.exit(1);
      }
    });
  });
});
