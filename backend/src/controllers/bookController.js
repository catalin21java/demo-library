import * as bookService from "../services/bookService.js";

function parseBookId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error("Book id must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }
  return id;
}

export async function getBooks(req, res, next) {
  try {
    const books = await bookService.listBooks();
    res.json(books);
  } catch (error) {
    next(error);
  }
}

export async function getBook(req, res, next) {
  try {
    const book = await bookService.getBook(parseBookId(req));
    res.json(book);
  } catch (error) {
    next(error);
  }
}

export async function createBook(req, res, next) {
  try {
    const book = await bookService.addBook(req.body);
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
}

export async function patchBook(req, res, next) {
  try {
    const book = await bookService.patchBook(parseBookId(req), req.body);
    res.json(book);
  } catch (error) {
    next(error);
  }
}

export async function deleteBook(req, res, next) {
  try {
    await bookService.removeBook(parseBookId(req));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
