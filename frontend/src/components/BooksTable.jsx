import { Link } from "react-router-dom";

import SortableTableHeader from "./SortableTableHeader";

const SORTABLE_COLUMNS = [
  { id: "id", label: "ID" },
  { id: "title", label: "Title" },
  { id: "author", label: "Author" },
];

function BookRow({ book, isFavouritePending, onFavouriteChange }) {
  return (
    <tr>
      <td>{book.id}</td>
      <td>{book.title}</td>
      <td>{book.author}</td>
      <td className="td-favourite">
        <label className="favourite-checkbox-label">
          <input
            type="checkbox"
            checked={Boolean(book.isFavourite)}
            disabled={isFavouritePending}
            onChange={(event) => onFavouriteChange(book, event.target.checked)}
            aria-label={`Favourite: ${book.title}`}
          />
        </label>
      </td>
      <td className="actions">
        <Link to={`/books/${book.id}`} className="link-button">
          View
        </Link>
      </td>
    </tr>
  );
}

export default function BooksTable({
  books,
  sort,
  onSort,
  pendingFavouriteId,
  onFavouriteChange,
}) {
  return (
    <table className="book-table">
      <thead>
        <tr>
          {SORTABLE_COLUMNS.map((column) => (
            <SortableTableHeader
              key={column.id}
              column={column.id}
              label={column.label}
              sort={sort}
              onSort={onSort}
            />
          ))}
          <th className="th-favourite">Favourite</th>
          <th className="th-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <BookRow
            key={book.id}
            book={book}
            isFavouritePending={pendingFavouriteId === String(book.id)}
            onFavouriteChange={onFavouriteChange}
          />
        ))}
      </tbody>
    </table>
  );
}
