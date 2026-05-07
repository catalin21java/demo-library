export default function BooksPagination({ totalBooks, pageIndex, pageSize, onPageChange }) {
  if (totalBooks === 0) {
    return null;
  }

  const totalPages = Math.ceil(totalBooks / pageSize);
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const rangeStart = safePageIndex * pageSize + 1;
  const rangeEnd = Math.min(totalBooks, safePageIndex * pageSize + pageSize);

  return (
    <nav className="pagination" aria-label="Book list pages">
      <p className="pagination-summary">
        Showing {rangeStart}–{rangeEnd} of {totalBooks}
        {totalPages > 1 ? ` · Page ${safePageIndex + 1} of ${totalPages}` : null}
      </p>
      {totalPages > 1 ? (
        <div className="pagination-actions">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(Math.max(0, safePageIndex - 1))}
            disabled={safePageIndex <= 0}
          >
            Previous
          </button>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(Math.min(totalPages - 1, safePageIndex + 1))}
            disabled={safePageIndex >= totalPages - 1}
          >
            Next
          </button>
        </div>
      ) : null}
    </nav>
  );
}
