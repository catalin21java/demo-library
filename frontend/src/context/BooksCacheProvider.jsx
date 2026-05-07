import { useCallback, useMemo, useState } from "react";

import {
  createBookRequest,
  deleteBookRequest,
  fetchBookById,
  fetchBooks,
  updateBookRequest,
} from "../api/booksApi";
import { BooksCacheContext } from "./booksCache";

const LOADED_BOOK_STATE = Object.freeze({
  hasLoaded: true,
  isLoading: false,
  isRefreshing: false,
  error: "",
});

const LOADING_BOOK_STATE = Object.freeze({
  hasLoaded: false,
  isLoading: true,
  isRefreshing: false,
  error: "",
});

function buildErrorBookState(error) {
  return {
    hasLoaded: false,
    isLoading: false,
    isRefreshing: false,
    error: error.message || "Failed to load book.",
    status: error.status,
  };
}

export function BooksCacheProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [hasLoadedBooks, setHasLoadedBooks] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState("");
  const [bookById, setBookById] = useState({});
  const [bookStatesById, setBookStatesById] = useState({});

  const upsertBook = useCallback((book) => {
    const normalizedId = String(book.id);
    setBookById((current) => ({ ...current, [normalizedId]: book }));
    setBookStatesById((current) => ({
      ...current,
      [normalizedId]: LOADED_BOOK_STATE,
    }));
  }, []);

  const loadBooks = useCallback(async () => {
    if (booksLoading || hasLoadedBooks) {
      return;
    }

    setBooksLoading(true);
    setBooksError("");
    try {
      const data = await fetchBooks();
      setBooks(data);
      setHasLoadedBooks(true);
      setBookById((current) => {
        const next = { ...current };
        data.forEach((book) => {
          next[String(book.id)] = book;
        });
        return next;
      });
      setBookStatesById((current) => {
        const next = { ...current };
        data.forEach((book) => {
          next[String(book.id)] = LOADED_BOOK_STATE;
        });
        return next;
      });
    } catch (error) {
      setBooksError(error.message || "Failed to load books.");
    } finally {
      setBooksLoading(false);
    }
  }, [booksLoading, hasLoadedBooks]);

  const loadBookById = useCallback(
    async (id) => {
      const normalizedId = String(id);
      const currentState = bookStatesById[normalizedId];
      const alreadyLoaded = currentState?.hasLoaded;
      const currentlyBusy = currentState?.isLoading || currentState?.isRefreshing;

      if (alreadyLoaded || currentlyBusy) {
        return;
      }

      setBookStatesById((current) => ({
        ...current,
        [normalizedId]: LOADING_BOOK_STATE,
      }));

      try {
        const book = await fetchBookById(normalizedId);
        setBookById((current) => ({ ...current, [normalizedId]: book }));
        setBookStatesById((current) => ({
          ...current,
          [normalizedId]: LOADED_BOOK_STATE,
        }));
        setBooks((currentBooks) => {
          const exists = currentBooks.some(
            (currentBook) => String(currentBook.id) === normalizedId,
          );
          if (!exists) {
            return currentBooks;
          }
          return currentBooks.map((currentBook) =>
            String(currentBook.id) === normalizedId ? book : currentBook,
          );
        });
      } catch (error) {
        setBookStatesById((current) => ({
          ...current,
          [normalizedId]: buildErrorBookState(error),
        }));
      }
    },
    [bookStatesById],
  );

  const createBook = useCallback(
    async (newBook) => {
      const createdBook = await createBookRequest(newBook);
      setBooks((currentBooks) => [...currentBooks, createdBook]);
      setHasLoadedBooks(true);
      upsertBook(createdBook);
      return createdBook;
    },
    [upsertBook],
  );

  const updateBook = useCallback(
    async (id, payload) => {
      const normalizedId = String(id);
      const updatedBook = await updateBookRequest(normalizedId, payload);
      setBooks((currentBooks) =>
        currentBooks.map((currentBook) =>
          String(currentBook.id) === normalizedId ? updatedBook : currentBook,
        ),
      );
      upsertBook(updatedBook);
      return updatedBook;
    },
    [upsertBook],
  );

  const removeBook = useCallback(async (id) => {
    const normalizedId = String(id);
    await deleteBookRequest(normalizedId);

    setBooks((currentBooks) =>
      currentBooks.filter((currentBook) => String(currentBook.id) !== normalizedId),
    );
    setBookById((current) => {
      const next = { ...current };
      delete next[normalizedId];
      return next;
    });
    setBookStatesById((current) => {
      const next = { ...current };
      delete next[normalizedId];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      books,
      booksLoading,
      booksError,
      hasLoadedBooks,
      bookById,
      bookStatesById,
      loadBooks,
      loadBookById,
      createBook,
      updateBook,
      removeBook,
    }),
    [
      bookById,
      bookStatesById,
      books,
      booksError,
      booksLoading,
      createBook,
      hasLoadedBooks,
      loadBookById,
      loadBooks,
      removeBook,
      updateBook,
    ],
  );

  return <BooksCacheContext.Provider value={value}>{children}</BooksCacheContext.Provider>;
}
