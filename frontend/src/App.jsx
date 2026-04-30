import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import "./App.css";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function fetchBooks() {
  const response = await fetch(`${apiBaseUrl}/books`); // books?includeCreatedAt=true
  if (!response.ok) {
    throw new Error("Failed to load books.");
  }
  return response.json();
}

async function fetchBookById(id) {
  const response = await fetch(`${apiBaseUrl}/books/${id}`);
  if (response.status === 404) {
    const notFoundError = new Error("Not found");
    notFoundError.status = 404;
    throw notFoundError;
  }
  if (!response.ok) {
    throw new Error("Failed to load book.");
  }
  return response.json();
}

const BooksCacheContext = createContext(null);

function BooksCacheProvider({ children }) {
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
      [normalizedId]: {
        hasLoaded: true,
        isLoading: false,
        isRefreshing: false,
        error: "",
      },
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
          next[String(book.id)] = {
            hasLoaded: true,
            isLoading: false,
            isRefreshing: false,
            error: "",
          };
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
        [normalizedId]: {
          hasLoaded: false,
          isLoading: true,
          isRefreshing: false,
          error: "",
        },
      }));

      try {
        const book = await fetchBookById(normalizedId);
        setBookById((current) => ({ ...current, [normalizedId]: book }));
        setBookStatesById((current) => ({
          ...current,
          [normalizedId]: {
            hasLoaded: true,
            isLoading: false,
            isRefreshing: false,
            error: "",
          },
        }));
        setBooks((currentBooks) => {
          const exists = currentBooks.some((currentBook) => String(currentBook.id) === normalizedId);
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
          [normalizedId]: {
            hasLoaded: false,
            isLoading: false,
            isRefreshing: false,
            error: error.message || "Failed to load book.",
            status: error.status,
          },
        }));
      }
    },
    [bookStatesById],
  );

  const createBook = useCallback(
    async (newBook) => {
      const response = await fetch(`${apiBaseUrl}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      });

      if (!response.ok) {
        const apiError = await response.json();
        throw new Error(apiError.message || "Failed to create book.");
      }

      const createdBook = await response.json();
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
      const response = await fetch(`${apiBaseUrl}/books/${normalizedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const apiError = await response.json();
        throw new Error(apiError.message || "Failed to update book.");
      }

      const updatedBook = await response.json();
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
    const response = await fetch(`${apiBaseUrl}/books/${normalizedId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const apiError = await response.json();
      throw new Error(apiError.message || "Failed to delete book.");
    }

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

function useBooksCache() {
  const context = useContext(BooksCacheContext);
  if (!context) {
    throw new Error("useBooksCache must be used within BooksCacheProvider.");
  }
  return context;
}

function compareBooksForSort(bookA, bookB, column, direction) {
  const invert = direction === "desc" ? -1 : 1;
  if (column === "id") {
    const idA = Number(bookA.id);
    const idB = Number(bookB.id);
    if (idA !== idB) {
      return idA < idB ? -invert : invert;
    }
    return 0;
  }
  const valueA = bookA[column] == null ? "" : String(bookA[column]);
  const valueB = bookB[column] == null ? "" : String(bookB[column]);
  return valueA.localeCompare(valueB, undefined, { sensitivity: "base" }) * invert;
}

const BOOKS_PAGE_SIZE = 10;

function BooksListPage() {
  const [form, setForm] = useState({ title: "", author: "", publishedYear: "" });
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [sort, setSort] = useState({ column: "id", direction: "asc" });
  const [pageIndex, setPageIndex] = useState(0);
  const { books, booksError, booksLoading, loadBooks, createBook } = useBooksCache();

  const sortedBooks = useMemo(() => {
    const nextBooks = [...books];
    nextBooks.sort((bookA, bookB) =>
      compareBooksForSort(bookA, bookB, sort.column, sort.direction),
    );
    return nextBooks;
  }, [books, sort]);

  const totalBooks = sortedBooks.length;
  const totalPages = totalBooks === 0 ? 0 : Math.ceil(totalBooks / BOOKS_PAGE_SIZE);

  useEffect(() => {
    if (totalPages === 0) {
      setPageIndex(0);
      return;
    }
    setPageIndex((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  const safePageIndex = totalPages === 0 ? 0 : Math.min(pageIndex, totalPages - 1);

  const paginatedBooks = useMemo(() => {
    const start = safePageIndex * BOOKS_PAGE_SIZE;
    return sortedBooks.slice(start, start + BOOKS_PAGE_SIZE);
  }, [sortedBooks, safePageIndex]);

  const rangeStart = totalBooks === 0 ? 0 : safePageIndex * BOOKS_PAGE_SIZE + 1;
  const rangeEnd = totalBooks === 0 ? 0 : Math.min(totalBooks, safePageIndex * BOOKS_PAGE_SIZE + BOOKS_PAGE_SIZE);

  function handleSort(column) {
    setSort((current) =>
      current.column === column
        ? { column, direction: current.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "asc" },
    );
  }

  function sortLabel(column) {
    if (sort.column !== column) {
      return "";
    }
    return sort.direction === "asc" ? " ▲" : " ▼";
  }

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  async function handleSubmit(event) {
    event.preventDefault();
    setCreateError("");
    setIsCreating(true);
    try {
      await createBook(form);
      setForm({ title: "", author: "", publishedYear: "" });
    } catch (error) {
      setCreateError(error.message || "Failed to create book.");
    } finally {
      setIsCreating(false);
    }
  }

  const error = booksError || createError || "";
  const loading = booksLoading;

  return (
    <main className="app">
      <h1>Books</h1>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          placeholder="Title"
        />
        <input
          value={form.author}
          onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
          placeholder="Author"
        />
        <input
          value={form.publishedYear}
          onChange={(event) =>
            setForm((current) => ({ ...current, publishedYear: event.target.value }))
          }
          placeholder="Published year"
        />
        <button type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create"}
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p>Loading books...</p> : null}
      {!loading ? (
        <table className="book-table">
          <thead>
            <tr>
              <th
                className="th-sortable"
                aria-sort={sort.column === "id" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <button type="button" className="sort-btn" onClick={() => handleSort("id")}>
                  ID
                  <span aria-hidden>{sortLabel("id")}</span>
                </button>
              </th>
              <th
                className="th-sortable"
                aria-sort={
                  sort.column === "title" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"
                }
              >
                <button type="button" className="sort-btn" onClick={() => handleSort("title")}>
                  Title
                  <span aria-hidden>{sortLabel("title")}</span>
                </button>
              </th>
              <th
                className="th-sortable"
                aria-sort={
                  sort.column === "author" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"
                }
              >
                <button type="button" className="sort-btn" onClick={() => handleSort("author")}>
                  Author
                  <span aria-hidden>{sortLabel("author")}</span>
                </button>
              </th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBooks.map((book) => {
              return (
                <tr key={book.id}>
                  <td>{book.id}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td className="actions">
                    <Link to={`/books/${book.id}`} className="link-button">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}
      {!loading && totalBooks > 0 ? (
        <nav className="pagination" aria-label="Book list pages">
          <p className="pagination-summary">
            Showing {rangeStart}–{rangeEnd} of {totalBooks}
            {totalPages > 1 ? ` · Page ${safePageIndex + 1} of ${totalPages}` : null}
          </p>
          {totalPages > 1 ? (
            <div className="pagination-actions">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
                disabled={safePageIndex <= 0}
              >
                Previous
              </button>
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setPageIndex((current) => Math.min(totalPages - 1, current + 1))}
                disabled={safePageIndex >= totalPages - 1}
              >
                Next
              </button>
            </div>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}

function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editForm, setEditForm] = useState({ title: "", author: "", publishedYear: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { books, bookById, bookStatesById, loadBookById, updateBook, removeBook } = useBooksCache();

  const fallbackBook = books.find((currentBook) => String(currentBook.id) === id);
  const book = bookById[id] ?? fallbackBook;
  const bookState = bookStatesById[id] || {};

  useEffect(() => {
    loadBookById(id);
  }, [id, loadBookById]);

  async function saveEdit() {
    setSaveError("");
    setIsSaving(true);
    try {
      const updatedBook = await updateBook(id, editForm);
      setEditForm({
        title: updatedBook.title,
        author: updatedBook.author,
        publishedYear: updatedBook.publishedYear ?? "",
      });
      setIsEditing(false);
    } catch (error) {
      setSaveError(error.message || "Failed to update book.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteBook() {
    setDeleteError("");
    setIsDeleting(true);
    try {
      await removeBook(id);
      navigate("/books");
    } catch (error) {
      setDeleteError(error.message || "Failed to delete book.");
    } finally {
      setIsDeleting(false);
    }
  }

  const loading = bookState.isLoading || (!bookState.hasLoaded && !book);
  const notFound = bookState.status === 404;
  const error = useMemo(() => {
    if (saveError) return saveError;
    if (deleteError) return deleteError;
    if (notFound) return "";
    return bookState.error || "";
  }, [bookState.error, deleteError, notFound, saveError]);

  if (loading) {
    return (
      <main className="app">
        <p>Loading book...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="app">
        <h1>Book not found</h1>
        <p>This page is no longer available.</p>
        <Link to="/books">Back to books</Link>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="app">
        <h1>Book details</h1>
        <p>{error || "Unable to load book right now."}</p>
        <Link to="/books">Back to books</Link>
      </main>
    );
  }

  return (
    <main className="app">
      <h1>Book details</h1>
      <p>
        <Link to="/books">Back to books</Link>
      </p>
      {error ? <p className="error">{error}</p> : null}
      {bookState.isRefreshing && !loading ? <p>Refreshing book...</p> : null}
      <section className="detail-card">
        <label>
          Title
          <input
            value={isEditing ? editForm.title : book.title}
            disabled={!isEditing}
            onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
          />
        </label>
        <label>
          Author
          <input
            value={isEditing ? editForm.author : book.author}
            disabled={!isEditing}
            onChange={(event) =>
              setEditForm((current) => ({ ...current, author: event.target.value }))
            }
          />
        </label>
        <label>
          Published year
          <input
            value={isEditing ? editForm.publishedYear : book.publishedYear ?? ""}
            disabled={!isEditing}
            onChange={(event) =>
              setEditForm((current) => ({ ...current, publishedYear: event.target.value }))
            }
          />
        </label>
        <p className="meta">Created: {new Date(book.createdAt).toLocaleString()}</p>
        <div className="actions">
          {isEditing ? (
            <>
              <button type="button" onClick={saveEdit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditForm({
                    title: book.title,
                    author: book.author,
                    publishedYear: book.publishedYear ?? "",
                  });
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditForm({
                    title: book.title,
                    author: book.author,
                    publishedYear: book.publishedYear ?? "",
                  });
                  setIsEditing(true);
                }}
              >
                Edit
              </button>
              <button type="button" onClick={deleteBook} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <BooksCacheProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/books" replace />} />
        <Route path="/books" element={<BooksListPage />} />
        <Route path="/books/:id" element={<BookDetailsPage />} />
        <Route path="*" element={<Navigate to="/books" replace />} />
      </Routes>
    </BooksCacheProvider>
  );
}

export default App;