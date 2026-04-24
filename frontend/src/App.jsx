import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import "./App.css";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function fetchBooks() {
  const response = await fetch(`${apiBaseUrl}/books`);
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

function BooksListPage() {
  const [form, setForm] = useState({ title: "", author: "", publishedYear: "" });
  const queryClient = useQueryClient();
  const booksQuery = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  });

  const createBookMutation = useMutation({
    mutationFn: async (newBook) => {
      const response = await fetch(`${apiBaseUrl}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      });

      if (!response.ok) {
        const apiError = await response.json();
        throw new Error(apiError.message || "Failed to create book.");
      }

      return response.json();
    },
    onSuccess: (createdBook) => {
      queryClient.setQueryData(["books"], (currentBooks = []) => [...currentBooks, createdBook]);
      queryClient.setQueryData(["book", String(createdBook.id)], createdBook);
      setForm({ title: "", author: "", publishedYear: "" });
    },
  });

  async function handleSubmit(event) {
    event.preventDefault();
    createBookMutation.reset();
    await createBookMutation.mutateAsync(form);
  }

  const books = booksQuery.data ?? [];
  const error = booksQuery.error?.message || createBookMutation.error?.message || "";
  const loading = booksQuery.isPending;

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
        <button type="submit">Create</button>
      </form>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p>Loading books...</p> : null}
      {booksQuery.isFetching && !loading ? <p>Refreshing books...</p> : null}

      {!loading ? (
        <table className="book-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => {
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
    </main>
  );
}

function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editForm, setEditForm] = useState({ title: "", author: "", publishedYear: "" });
  const [isEditing, setIsEditing] = useState(false);
  const booksListCache = queryClient.getQueryData(["books"]);
  const booksListUpdatedAt = queryClient.getQueryState(["books"])?.dataUpdatedAt;
  const bookQuery = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBookById(id),
    initialData: () => {
      const cachedBook = queryClient.getQueryData(["book", id]);
      if (cachedBook) {
        return cachedBook;
      }

      if (!Array.isArray(booksListCache)) {
        return undefined;
      }

      return booksListCache.find((currentBook) => String(currentBook.id) === id);
    },
    initialDataUpdatedAt: booksListUpdatedAt,
  });
  const book = bookQuery.data;

  const saveEditMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await fetch(`${apiBaseUrl}/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const apiError = await response.json();
        throw new Error(apiError.message || "Failed to update book.");
      }

      return response.json();
    },
    onSuccess: (updatedBook) => {
      queryClient.setQueryData(["book", id], updatedBook);
      queryClient.setQueryData(["books"], (currentBooks = []) =>
        currentBooks.map((currentBook) =>
          currentBook.id === updatedBook.id ? updatedBook : currentBook,
        ),
      );
      setEditForm({
        title: updatedBook.title,
        author: updatedBook.author,
        publishedYear: updatedBook.publishedYear ?? "",
      });
      setIsEditing(false);
    },
  });

  async function saveEdit() {
    saveEditMutation.reset();
    await saveEditMutation.mutateAsync(editForm);
  }

  const deleteBookMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${apiBaseUrl}/books/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const apiError = await response.json();
        throw new Error(apiError.message || "Failed to delete book.");
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["book", id] });
      queryClient.setQueryData(["books"], (currentBooks = []) =>
        currentBooks.filter((currentBook) => String(currentBook.id) !== id),
      );
      navigate("/books");
    },
  });

  async function deleteBook() {
    deleteBookMutation.reset();
    await deleteBookMutation.mutateAsync();
  }

  const loading = bookQuery.isPending;
  const notFound = bookQuery.error?.status === 404;
  const error = useMemo(() => {
    return (
      saveEditMutation.error?.message ||
      deleteBookMutation.error?.message ||
      (bookQuery.error && !notFound ? bookQuery.error.message : "")
    );
  }, [bookQuery.error, deleteBookMutation.error, notFound, saveEditMutation.error]);

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
      {bookQuery.isFetching && !loading ? <p>Refreshing book...</p> : null}
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
              <button type="button" onClick={saveEdit}>
                Save
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
              <button type="button" onClick={deleteBook}>
                Delete
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
    <Routes>
      <Route path="/" element={<Navigate to="/books" replace />} />
      <Route path="/books" element={<BooksListPage />} />
      <Route path="/books/:id" element={<BookDetailsPage />} />
      <Route path="*" element={<Navigate to="/books" replace />} />
    </Routes>
  );
}

export default App;
