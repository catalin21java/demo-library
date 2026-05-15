export function nextSortState(currentSort, column) {
  if (currentSort.column !== column) {
    return { column, direction: "asc" };
  }
  return {
    column,
    direction: currentSort.direction === "asc" ? "desc" : "asc",
  };
}

export function filterBooksBySearch(books, search) {
  const query = search.trim().toLowerCase();
  if (!query) {
    return books;
  }
  return books.filter((book) => {
    const haystack = `${book.title ?? ""} ${book.author ?? ""}`.toLowerCase();
    return haystack.includes(query);
  });
}

export function filterBooksByScope(books, scope, favouriteIds) {
  if (scope !== "favourites") {
    return books;
  }
  return books.filter((book) => favouriteIds.has(String(book.id)));
}

export function filterBooksByMinRating(books, minRating) {
  const threshold = Number(minRating ?? 0);
  if (!threshold || threshold <= 0) {
    return books;
  }
  return books.filter((book) => Number(book.rating ?? 0) >= threshold);
}
