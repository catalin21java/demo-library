import RatingStars from "./RatingStars";

function BookDetailField({ label, value, isEditing, onChange }) {
  return (
    <label>
      {label}
      <input
        value={value}
        disabled={!isEditing}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function BookDetailActions({
  isEditing,
  isSaving,
  isDeleting,
  onStartEditing,
  onCancelEditing,
  onSave,
  onDelete,
}) {
  if (isEditing) {
    return (
      <div className="actions">
        <button type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancelEditing}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="actions">
      <button type="button" onClick={onStartEditing}>
        Edit
      </button>
      <button type="button" onClick={onDelete} disabled={isDeleting}>
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}

export default function BookDetailCard({
  book,
  isEditing,
  editForm,
  onEditFormChange,
  onStartEditing,
  onCancelEditing,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  canEdit = false,
  isFavourite = false,
  isFavouritePending = false,
  onFavouriteChange,
}) {
  function handleFieldChange(field, value) {
    onEditFormChange((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="detail-card">
      <BookDetailField
        label="Title"
        value={isEditing ? editForm.title : book.title}
        isEditing={isEditing}
        onChange={(value) => handleFieldChange("title", value)}
      />
      <BookDetailField
        label="Author"
        value={isEditing ? editForm.author : book.author}
        isEditing={isEditing}
        onChange={(value) => handleFieldChange("author", value)}
      />
      <BookDetailField
        label="Published year"
        value={isEditing ? editForm.publishedYear : book.publishedYear ?? ""}
        isEditing={isEditing}
        onChange={(value) => handleFieldChange("publishedYear", value)}
      />
      <div className="rating-detail">
        <label className="rating-detail-label">Rating</label>
        <RatingStars
          rating={isEditing ? editForm.rating : book.rating ?? 0}
          onChange={
            isEditing ? (nextRating) => handleFieldChange("rating", nextRating) : undefined
          }
          disabled={Boolean(isSaving || isDeleting) || !isEditing}
        />
      </div>
      {onFavouriteChange ? (
      <label className="favourite-detail">
        Favourite
        <input
          type="checkbox"
          checked={isFavourite}
          disabled={isFavouritePending}
          onChange={(event) => onFavouriteChange(event.target.checked)}
        />
      </label>
      ) : null}
      <p className="meta">Created: {new Date(book.createdAt).toLocaleString()}</p>
      {canEdit ? (
        <BookDetailActions
          isEditing={isEditing}
          isSaving={isSaving}
          isDeleting={isDeleting}
          onStartEditing={onStartEditing}
          onCancelEditing={onCancelEditing}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : null}
    </section>
  );
}
