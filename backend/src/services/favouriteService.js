import * as bookRepository from "../repositories/bookRepository.js";
import * as favouriteRepository from "../repositories/favouriteRepository.js";

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseBookId(bookId) {
  const id = Number(bookId);
  if (!Number.isInteger(id) || id < 1) {
    throw createHttpError("Book id must be a positive integer.", 400);
  }
  return id;
}

export async function listMyFavourites(userId) {
  return favouriteRepository.listFavouriteBookIds(userId);
}

export async function addFavourite(userId, bookId) {
  const normalizedBookId = parseBookId(bookId);
  const book = await bookRepository.getBookById(normalizedBookId);
  if (!book) {
    throw createHttpError("Book not found.", 404);
  }
  await favouriteRepository.addFavourite(userId, normalizedBookId);
  return { bookId: normalizedBookId };
}

export async function removeFavourite(userId, bookId) {
  const normalizedBookId = parseBookId(bookId);
  const removed = await favouriteRepository.removeFavourite(userId, normalizedBookId);
  if (!removed) {
    throw createHttpError("Favourite not found.", 404);
  }
}
