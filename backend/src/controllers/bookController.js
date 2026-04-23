import * as bookService from "../services/bookService.js";

export async function getBooks(req, res, next) {
  try {
    const books = await bookService.listBooks();
    res.json(books);
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
    const book = await bookService.patchBook(Number(req.params.id), req.body);
    res.json(book);
  } catch (error) {
    next(error);
  }
}

export async function deleteBook(req, res, next) {
  try {
    await bookService.removeBook(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}


