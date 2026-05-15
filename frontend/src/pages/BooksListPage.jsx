import { useEffect, useMemo, useState } from "react";

import AppHeader from "../components/AppHeader";
import BookCreateForm from "../components/BookCreateForm";
import BooksPagination from "../components/BooksPagination";
import BooksTable from "../components/BooksTable";
import BooksToolbar from "../components/BooksToolbar";
import useAuth from "../hooks/useAuth";
import useBookFieldUpdate from "../hooks/useBookFieldUpdate";
import useBooksCache from "../hooks/useBooksCache";
import useFavourites from "../hooks/useFavourites";
import { BOOKS_PAGE_SIZE } from "../utils/constants";
import {
  filterBooksByMinRating,
  filterBooksByScope,
  filterBooksBySearch,
  nextSortState,
} from "../utils/bookFilters";
import { compareBooksForSort } from "../utils/sortBooks";

const DEFAULT_SORT = { column: "id", direction: "asc" };

export default function BooksListPage() {
  const { isAdmin } = useAuth();
  const { books, booksError, booksLoading, loadBooks } = useBooksCache();
  const {
    favouriteIds,
    isFavourite,
    toggleFavourite,
    pendingId: pendingFavouriteId,
    error: favouriteToggleError,
  } = useFavourites();
  const {
    updateField: handleRatingChange,
    pendingId: pendingRatingId,
    error: ratingError,
  } = useBookFieldUpdate("rating", "Could not update rating.");

  const [createError, setCreateError] = useState("");
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [pageIndex, setPageIndex] = useState(0);
  const [listSearch, setListSearch] = useState("");
  const [listScope, setListScope] = useState("all");
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const visibleBooks = useMemo(() => {
    const sorted = [...books].sort((a, b) =>
      compareBooksForSort(a, b, sort.column, sort.direction),
    );
    const scoped = filterBooksByScope(sorted, listScope, favouriteIds);
    const rated = filterBooksByMinRating(scoped, minRating);
    return filterBooksBySearch(rated, listSearch);
  }, [books, sort, listScope, listSearch, minRating, favouriteIds]);

  const totalBooks = visibleBooks.length;
  const totalPages = totalBooks === 0 ? 0 : Math.ceil(totalBooks / BOOKS_PAGE_SIZE);
  const safePageIndex = totalPages === 0 ? 0 : Math.min(pageIndex, totalPages - 1);

  const paginatedBooks = useMemo(() => {
    const start = safePageIndex * BOOKS_PAGE_SIZE;
    return visibleBooks.slice(start, start + BOOKS_PAGE_SIZE);
  }, [visibleBooks, safePageIndex]);

  function handleSort(column) {
    setSort((current) => nextSortState(current, column));
  }

  function handleScopeChange(nextScope) {
    setListScope(nextScope);
    setPageIndex(0);
  }

  function handleSearchChange(nextSearch) {
    setListSearch(nextSearch);
    setPageIndex(0);
  }

  function handleMinRatingChange(nextMinRating) {
    setMinRating(nextMinRating);
    setPageIndex(0);
  }

  function handleFavouriteChange(book, checked) {
    if (checked === isFavourite(book.id)) {
      return;
    }
    toggleFavourite(book);
  }

  const error = booksError || createError || favouriteToggleError || ratingError || "";

  return (
    <main className="app">
      <AppHeader />
      <h1>Books</h1>

      {isAdmin ? <BookCreateForm onError={setCreateError} /> : null}

      <BooksToolbar
        listScope={listScope}
        onScopeChange={handleScopeChange}
        listSearch={listSearch}
        onSearchChange={handleSearchChange}
        minRating={minRating}
        onMinRatingChange={handleMinRatingChange}
      />

      {error ? <p className="error">{error}</p> : null}
      {booksLoading ? <p>Loading books...</p> : null}

      {!booksLoading ? (
        <BooksTable
          books={paginatedBooks}
          sort={sort}
          onSort={handleSort}
          isFavourite={isFavourite}
          pendingFavouriteId={pendingFavouriteId}
          onFavouriteChange={handleFavouriteChange}
          pendingRatingId={pendingRatingId}
          onRatingChange={handleRatingChange}
          canEditRating={isAdmin}
        />
      ) : null}

      {!booksLoading && totalBooks > 0 ? (
        <BooksPagination
          totalBooks={totalBooks}
          pageIndex={safePageIndex}
          pageSize={BOOKS_PAGE_SIZE}
          onPageChange={setPageIndex}
        />
      ) : null}
    </main>
  );
}
