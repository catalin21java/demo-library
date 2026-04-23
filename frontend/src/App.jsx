import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import "./App.css";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function BooksListPage() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: "", author: "", publishedYear: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function fetchBooks() {
      try {
        const response = await fetch(`${apiBaseUrl}/books`);
        if (!response.ok) {
          throw new Error("Failed to load books.");
        }
        const data = await response.json();
        if (isActive) {
          setBooks(data);
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    fetchBooks();
    return () => {
      isActive = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const apiError = await response.json();
        throw new Error(apiError.message || "Failed to create book.");
      }

      const createdBook = await response.json();
      setBooks((currentBooks) => [...currentBooks, createdBook]);
      setForm({ title: "", author: "", publishedYear: "" });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

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
  const [book, setBook] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", author: "", publishedYear: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function fetchBook() {
      try {
        const response = await fetch(`${apiBaseUrl}/books/${id}`);
        if (response.status === 404) {
          if (isActive) {
            setNotFound(true);
          }
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to load book.");
        }

        const data = await response.json();
        if (isActive) {
          setBook(data);
          setEditForm({
            title: data.title,
            author: data.author,
            publishedYear: data.publishedYear ?? "",
          });
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    fetchBook();
    return () => {
      isActive = false;
    };
  }, [id]);

  async function saveEdit() {
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const apiError = await response.json();
        throw new Error(apiError.message || "Failed to update book.");
      }

      const updatedBook = await response.json();
      setBook(updatedBook);
      setEditForm({
        title: updatedBook.title,
        author: updatedBook.author,
        publishedYear: updatedBook.publishedYear ?? "",
      });
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteBook() {
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/books/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const apiError = await response.json();
        throw new Error(apiError.message || "Failed to delete book.");
      }

      navigate("/books");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

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

  return (
    <main className="app">
      <h1>Book details</h1>
      <p>
        <Link to="/books">Back to books</Link>
      </p>
      {error ? <p className="error">{error}</p> : null}
      <section className="detail-card">
        <label>
          Title
          <input
            value={editForm.title}
            disabled={!isEditing}
            onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
          />
        </label>
        <label>
          Author
          <input
            value={editForm.author}
            disabled={!isEditing}
            onChange={(event) =>
              setEditForm((current) => ({ ...current, author: event.target.value }))
            }
          />
        </label>
        <label>
          Published year
          <input
            value={editForm.publishedYear}
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
              <button type="button" onClick={() => setIsEditing(true)}>
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
