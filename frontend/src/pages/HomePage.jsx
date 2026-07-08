import { useEffect, useMemo, useState } from "react";

import AppHeader from "../components/AppHeader";
import BooksPagination from "../components/BooksPagination";
import BooksTable from "../components/BooksTable";
import BooksToolbar from "../components/BooksToolbar";
import useBooksCache from "../hooks/useBooksCache";
import { BOOKS_PAGE_SIZE } from "../utils/constants";
import { filterBooksByMinRating, filterBooksBySearch, nextSortState } from "../utils/bookFilters";
import { compareBooksForSort } from "../utils/sortBooks";

const DEFAULT_SORT = { column: "id", direction: "asc" };

export default function HomePage() {
  const { books, booksError, booksLoading, loadBooks } = useBooksCache();

  const [sort, setSort] = useState(DEFAULT_SORT);
  const [pageIndex, setPageIndex] = useState(0);
  const [listSearch, setListSearch] = useState("");
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const visibleBooks = useMemo(() => {
    const sorted = [...books].sort((a, b) =>
      compareBooksForSort(a, b, sort.column, sort.direction),
    );
    const rated = filterBooksByMinRating(sorted, minRating);
    return filterBooksBySearch(rated, listSearch);
  }, [books, sort, listSearch, minRating]);

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

  function handleSearchChange(nextSearch) {
    setListSearch(nextSearch);
    setPageIndex(0);
  }

  function handleMinRatingChange(nextMinRating) {
    setMinRating(nextMinRating);
    setPageIndex(0);
  }

  return (
    <main className="app">
      <AppHeader />
      <h1>Books</h1>
      <p className="subtitle">Browse the library. Log in to save favourites and more.</p>

      <BooksToolbar
        listSearch={listSearch}
        onSearchChange={handleSearchChange}
        minRating={minRating}
        onMinRatingChange={handleMinRatingChange}
        showScopeToggle={false}
      />

      {booksError ? <p className="error">{booksError}</p> : null}
      {booksLoading ? <p>Loading books...</p> : null}

      {!booksLoading ? (
        <BooksTable
          books={paginatedBooks}
          sort={sort}
          onSort={handleSort}
          isFavourite={() => false}
          onFavouriteChange={() => {}}
          showFavourites={false}
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
