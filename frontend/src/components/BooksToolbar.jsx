const SCOPES = [
  { id: "all", label: "Show all" },
  { id: "favourites", label: "Show favourites" },
];

export default function BooksToolbar({
  listScope,
  onScopeChange,
  listSearch,
  onSearchChange,
}) {
  return (
    <div className="list-toolbar">
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
      <div className="list-search">
        <input
          type="search"
          value={listSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search list…"
          aria-label="Filter books in the list"
        />
      </div>
    </div>
  );
}
