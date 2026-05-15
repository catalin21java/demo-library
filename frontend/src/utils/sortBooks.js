const SORTABLE_STRING_COLUMNS = new Set(["title", "author"]);

export function compareBooksForSort(bookA, bookB, column, direction) {
  const invert = direction === "desc" ? -1 : 1;

  if (column === "id") {
    const idA = Number(bookA.id);
    const idB = Number(bookB.id);
    if (idA !== idB) {
      return idA < idB ? -invert : invert;
    }
    return 0;
  }

  if (SORTABLE_STRING_COLUMNS.has(column)) {
    const valueA = bookA[column] == null ? "" : String(bookA[column]);
    const valueB = bookB[column] == null ? "" : String(bookB[column]);
    return valueA.localeCompare(valueB, undefined, { sensitivity: "base" }) * invert;
  }

  throw new Error(`Unsupported sort column: ${column}`);
}
