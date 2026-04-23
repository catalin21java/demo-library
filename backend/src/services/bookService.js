import * as bookRepository from "../repositories/bookRepository.js";

function normalizeText(value, fieldName) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    const error = new Error(`${fieldName} is required.`);
    error.statusCode = 400;
    throw error;
  }
  return normalized;
}

function normalizePublishedYear(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsedYear = Number(value);
  if (!Number.isInteger(parsedYear) || parsedYear < 0) {
    const error = new Error("Published year must be a positive whole number.");
    error.statusCode = 400;
    throw error;
  }
  return parsedYear;
}

export async function listBooks() {
  return bookRepository.getAllBooks();
}

export async function addBook(payload) {
  const book = {
    title: normalizeText(payload.title, "Title"),
    author: normalizeText(payload.author, "Author"),
    publishedYear: normalizePublishedYear(payload.publishedYear),
  };
  return bookRepository.createBook(book);
}

export async function patchBook(id, payload) {
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(payload, "title")) {
    updates.title = normalizeText(payload.title, "Title");
  }
  if (Object.prototype.hasOwnProperty.call(payload, "author")) {
    updates.author = normalizeText(payload.author, "Author");
  }
  if (Object.prototype.hasOwnProperty.call(payload, "publishedYear")) {
    updates.publishedYear = normalizePublishedYear(payload.publishedYear);
  }

  if (Object.keys(updates).length === 0) {
    const error = new Error("At least one field is required for update.");
    error.statusCode = 400;
    throw error;
  }

  const updated = await bookRepository.updateBook(id, updates);
  if (!updated) {
    const error = new Error("Book not found.");
    error.statusCode = 404;
    throw error;
  }
  return updated;
}

export async function removeBook(id) {
  const removed = await bookRepository.deleteBook(id);
  if (!removed) {
    const error = new Error("Book not found.");
    error.statusCode = 404;
    throw error;
  }
}
