function ariaSortFor(sort, column) {
  if (sort.column !== column) {
    return "none";
  }
  return sort.direction === "asc" ? "ascending" : "descending";
}

function indicatorFor(sort, column) {
  if (sort.column !== column) {
    return "";
  }
  return sort.direction === "asc" ? " ▲" : " ▼";
}

export default function SortableTableHeader({ column, label, sort, onSort }) {
  return (
    <th className="th-sortable" aria-sort={ariaSortFor(sort, column)}>
      <button type="button" className="sort-btn" onClick={() => onSort(column)}>
        {label}
        <span aria-hidden>{indicatorFor(sort, column)}</span>
      </button>
    </th>
  );
}
