import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

  const booksLoadingRef = useRef(booksLoading);
  const hasLoadedBooksRef = useRef(hasLoadedBooks);
  const bookStatesByIdRef = useRef(bookStatesById);
  const loadBookInFlightRef = useRef(new Set());

  useEffect(() => {
    booksLoadingRef.current = booksLoading;
  }, [booksLoading]);

  useEffect(() => {
    hasLoadedBooksRef.current = hasLoadedBooks;
  }, [hasLoadedBooks]);

  useEffect(() => {
    bookStatesByIdRef.current = bookStatesById;
  }, [bookStatesById]);

  const upsertBook = useCallback((book) => {
    const normalizedId = String(book.id);
    setBookById((current) => ({ ...current, [normalizedId]: book }));
    setBookStatesById((current) => {
      const next = {
        ...current,
        [normalizedId]: LOADED_BOOK_STATE,
      };
      bookStatesByIdRef.current = next;
      return next;
    });
  }, []);

  const loadBooks = useCallback(async () => {
    if (booksLoadingRef.current || hasLoadedBooksRef.current) {
      return;
    }

    booksLoadingRef.current = true;
    setBooksLoading(true);
    setBooksError("");
    try {
      const data = await fetchBooks();
      setBooks(data);
      hasLoadedBooksRef.current = true;
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
        bookStatesByIdRef.current = next;
        return next;
      });
    } catch (error) {
      setBooksError(error.message || "Failed to load books.");
    } finally {
      booksLoadingRef.current = false;
      setBooksLoading(false);
    }
  }, []);

  const loadBookById = useCallback(async (id) => {
    const normalizedId = String(id);
    const currentState = bookStatesByIdRef.current[normalizedId];
    const alreadyLoaded = currentState?.hasLoaded;
    const inFlight = loadBookInFlightRef.current.has(normalizedId);

    if (alreadyLoaded || inFlight) {
      return;
    }

    loadBookInFlightRef.current.add(normalizedId);
    setBookStatesById((current) => ({
      ...current,
      [normalizedId]: LOADING_BOOK_STATE,
    }));

    try {
      const book = await fetchBookById(normalizedId);
      setBookById((current) => ({ ...current, [normalizedId]: book }));
      setBookStatesById((current) => {
        const next = {
          ...current,
          [normalizedId]: LOADED_BOOK_STATE,
        };
        bookStatesByIdRef.current = next;
        return next;
      });
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
      setBookStatesById((current) => {
        const next = {
          ...current,
          [normalizedId]: buildErrorBookState(error),
        };
        bookStatesByIdRef.current = next;
        return next;
      });
    } finally {
      loadBookInFlightRef.current.delete(normalizedId);
    }
  }, []);

  const createBook = useCallback(
    async (newBook) => {
      const createdBook = await createBookRequest(newBook);
      setBooks((currentBooks) => [...currentBooks, createdBook]);
      hasLoadedBooksRef.current = true;
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
      bookStatesByIdRef.current = next;
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
