import { useEffect, useState } from "react";
import "./App.css";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: "", author: "", publishedYear: "" });
  const [editingBookId, setEditingBookId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", author: "", publishedYear: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBooks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/books`);
      if (!response.ok) {
        throw new Error("Failed to load books.");
      }
      const data = await response.json();
      setBooks(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
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

  function startEdit(book) {
    setEditingBookId(book.id);
    setEditForm({
      title: book.title,
      author: book.author,
      publishedYear: book.publishedYear ?? "",
    });
  }

  function cancelEdit() {
    setEditingBookId(null);
    setEditForm({ title: "", author: "", publishedYear: "" });
  }

  async function saveEdit(bookId) {
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const apiError = await response.json();
        throw new Error(apiError.message || "Failed to update book.");
      }

      const updatedBook = await response.json();
      setBooks((currentBooks) =>
        currentBooks.map((book) => (book.id === bookId ? updatedBook : book))
      );
      cancelEdit();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteBook(bookId) {
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const apiError = await response.json();
        throw new Error(apiError.message || "Failed to delete book.");
      }

      setBooks((currentBooks) => currentBooks.filter((book) => book.id !== bookId));
      if (editingBookId === bookId) {
        cancelEdit();
      }
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
              <th>No.</th>
              <th>Title</th>
              <th>Author</th>
              <th>Year</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => {
              const isEditing = editingBookId === book.id;
              return (
                <tr key={book.id}>
                  <td>{index + 1}</td>
                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.title}
                        onChange={(event) =>
                          setEditForm((current) => ({ ...current, title: event.target.value }))
                        }
                      />
                    ) : (
                      book.title
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.author}
                        onChange={(event) =>
                          setEditForm((current) => ({ ...current, author: event.target.value }))
                        }
                      />
                    ) : (
                      book.author
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.publishedYear}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            publishedYear: event.target.value,
                          }))
                        }
                      />
                    ) : (
                      book.publishedYear ?? "-"
                    )}
                  </td>
                  <td>{new Date(book.createdAt).toLocaleString()}</td>
                  <td className="actions">
                    {isEditing ? (
                      <>
                        <button type="button" onClick={() => saveEdit(book.id)}>
                          Save
                        </button>
                        <button type="button" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(book)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => deleteBook(book.id)}>
                          Delete
                        </button>
                      </>
                    )}
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

export default App;
