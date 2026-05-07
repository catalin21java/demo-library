import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import BookDetailCard from "../components/BookDetailCard";
import useBooksCache from "../hooks/useBooksCache";

const EMPTY_EDIT_FORM = { title: "", author: "", publishedYear: "" };

function buildEditForm(book) {
  return {
    title: book.title,
    author: book.author,
    publishedYear: book.publishedYear ?? "",
  };
}

export default function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books, bookById, bookStatesById, loadBookById, updateBook, removeBook } =
    useBooksCache();

  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [isRatingUpdating, setIsRatingUpdating] = useState(false);

  const fallbackBook = books.find((currentBook) => String(currentBook.id) === id);
  const book = bookById[id] ?? fallbackBook;
  const bookState = bookStatesById[id] || {};

  useEffect(() => {
    loadBookById(id);
  }, [id, loadBookById]);

  async function handleSave() {
    setSaveError("");
    setRatingError("");
    setIsSaving(true);
    try {
      const updatedBook = await updateBook(id, editForm);
      setEditForm(buildEditForm(updatedBook));
      setIsEditing(false);
    } catch (error) {
      setSaveError(error.message || "Failed to update book.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteError("");
    setRatingError("");
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

  async function handleRatingChange(nextRating) {
    setRatingError("");
    setIsRatingUpdating(true);
    try {
      await updateBook(id, { rating: nextRating });
    } catch (error) {
      setRatingError(error.message || "Failed to update rating.");
    } finally {
      setIsRatingUpdating(false);
    }
  }

  function handleStartEditing() {
    setEditForm(buildEditForm(book));
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setEditForm(buildEditForm(book));
    setIsEditing(false);
  }

  const loading = bookState.isLoading || (!bookState.hasLoaded && !book);
  const notFound = bookState.status === 404;
  const error = useMemo(() => {
    if (saveError) return saveError;
    if (ratingError) return ratingError;
    if (deleteError) return deleteError;
    if (notFound) return "";
    return bookState.error || "";
  }, [bookState.error, deleteError, notFound, ratingError, saveError]);

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
      <BookDetailCard
        book={book}
        isEditing={isEditing}
        editForm={editForm}
        onEditFormChange={setEditForm}
        onStartEditing={handleStartEditing}
        onCancelEditing={handleCancelEditing}
        onSave={handleSave}
        onDelete={handleDelete}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onRatingChange={handleRatingChange}
        isRatingUpdating={isRatingUpdating}
      />
    </main>
  );
}
