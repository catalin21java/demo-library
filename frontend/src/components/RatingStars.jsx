const STAR_VALUES = Object.freeze([1, 2, 3, 4, 5]);

function StarIcon({ filled }) {
  const filledColor = "#f59e0b";
  const emptyColor = "#d1d5db";

  const color = filled ? filledColor : emptyColor;
  return (
    <svg
      className="rating-star"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill={filled ? color : "transparent"}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RatingStars({ rating, onChange, disabled }) {
  const currentRating = Number(rating ?? 0);
  const normalizedRating = Number.isInteger(currentRating) ? currentRating : 0;
  const canInteract = typeof onChange === "function";

  const renderedStars = STAR_VALUES.map((star) => {
    const filled = normalizedRating >= star;

    if (canInteract) {
      const isSelected = normalizedRating === star;
      return (
        <button
          key={star}
          type="button"
          className="rating-star-button"
          onClick={() => onChange(isSelected ? 0 : star)}
          disabled={disabled}
          aria-label={`Set rating to ${isSelected ? 0 : star}`}
          aria-pressed={isSelected}
        >
          <StarIcon filled={filled} />
        </button>
      );
    }

    return <StarIcon key={star} filled={filled} />;
  });

  if (!canInteract) {
    return (
      <div className="rating-stars" role="img" aria-label={`Rating: ${normalizedRating} out of 5`}>
        {renderedStars}
      </div>
    );
  }

  return <div className="rating-stars rating-stars--interactive">{renderedStars}</div>;
}

