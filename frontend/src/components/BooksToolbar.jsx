const SCOPES = [
  { id: "all", label: "Show all" },
  { id: "favourites", label: "Show favourites" },
];

export default function BooksToolbar({
  listScope,
  onScopeChange,
  listSearch,
  onSearchChange,
  minRating,
  onMinRatingChange,
  showScopeToggle = true,
}) {
  return (
    <div className="list-toolbar">
      {showScopeToggle ? (
        <div className="list-scope-toggle" role="group" aria-label="Which books to show">
          {SCOPES.map((scope) => {
            const isActive = listScope === scope.id;
            return (
              <button
                key={scope.id}
                type="button"
                className={`scope-btn${isActive ? " scope-btn-active" : ""}`}
                onClick={() => onScopeChange(scope.id)}
              >
                {scope.label}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="list-search">
        <input
          type="search"
          value={listSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search list…"
          aria-label="Filter books in the list"
        />
      </div>
      <div className="list-rating-filter">
        <select
          value={minRating}
          onChange={(event) => onMinRatingChange(Number(event.target.value))}
          aria-label="Filter books by minimum rating"
        >
          <option value={0}>Any ratings</option>
          <option value={1}>1+ stars</option>
          <option value={2}>2+ stars</option>
          <option value={3}>3+ stars</option>
          <option value={4}>4+ stars</option>
          <option value={5}>5 stars</option>
        </select>
      </div>
    </div>
  );
}
