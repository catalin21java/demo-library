import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import BookDetailCard from "../components/BookDetailCard";
import useAuth from "../hooks/useAuth";
import useBooksCache from "../hooks/useBooksCache";
import useFavourites from "../hooks/useFavourites";

const EMPTY_EDIT_FORM = { title: "", author: "", publishedYear: "", rating: 0 };

function buildEditForm(book) {
  return {
    title: book.title,
    author: book.author,
    publishedYear: book.publishedYear ?? "",
    rating: Number(book.rating ?? 0),
  };
}

export default function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();
  const { books, bookById, bookStatesById, loadBookById, updateBook, removeBook } =
    useBooksCache();
  const {
    isFavourite,
    toggleFavourite,
    pendingId: pendingFavouriteId,
    error: favouriteError,
  } = useFavourites();

  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fallbackBook = books.find((currentBook) => String(currentBook.id) === id);
  const book = bookById[id] ?? fallbackBook;
  const bookState = bookStatesById[id] || {};

  useEffect(() => {
    loadBookById(id);
  }, [id, loadBookById]);

  async function handleSave() {
    setSaveError("");
    const yearStr = String(editForm.publishedYear ?? "").trim();
    let publishedYear = null;
    if (yearStr !== "") {
      const parsedYear = Number(yearStr);
      if (!Number.isInteger(parsedYear) || parsedYear < 0) {
        setSaveError("Published year must be a positive whole number.");
        return;
      }
      publishedYear = parsedYear;
    }

    const rating = Number(editForm.rating);
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      setSaveError("Rating must be an integer between 0 and 5.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedBook = await updateBook(id, {
        title: String(editForm.title ?? "").trim(),
        author: String(editForm.author ?? "").trim(),
        publishedYear,
        rating,
      });
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

  function handleStartEditing() {
    setEditForm(buildEditForm(book));
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setEditForm(buildEditForm(book));
    setIsEditing(false);
  }

  function handleFavouriteChange(checked) {
    if (!book || checked === isFavourite(book.id)) {
      return;
    }
    toggleFavourite(book);
  }

  const loading = bookState.isLoading || (!bookState.hasLoaded && !book);
  const notFound = bookState.status === 404;
  const error =
    saveError ||
    deleteError ||
    favouriteError ||
    (notFound ? "" : bookState.error || "");

  const backTo = isAuthenticated ? "/books" : "/";

  if (loading) {
    return (
      <main className="app">
        <AppHeader />
        <p>Loading book...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="app">
        <AppHeader />
        <h1>Book not found</h1>
        <p>This page is no longer available.</p>
        <Link to={backTo}>Back to books</Link>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="app">
        <AppHeader />
        <h1>Book details</h1>
        <p>{error || "Unable to load book right now."}</p>
        <Link to={backTo}>Back to books</Link>
      </main>
    );
  }

  return (
    <main className="app">
      <AppHeader />
      <h1>Book details</h1>
      <p>
        <Link to={backTo}>Back to books</Link>
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
        canEdit={isAdmin}
        isFavourite={isAuthenticated ? isFavourite(book.id) : false}
        isFavouritePending={isAuthenticated && pendingFavouriteId === String(book.id)}
        onFavouriteChange={isAuthenticated ? handleFavouriteChange : undefined}
      />
    </main>
  );
}
