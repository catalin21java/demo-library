import { useCallback, useState } from "react";

import useBooksCache from "./useBooksCache";

export default function useFavouriteToggle() {
  const { updateBook } = useBooksCache();
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState("");

  const toggle = useCallback(
    async (book, nextIsFavourite) => {
      const normalizedId = String(book.id);
      setError("");
      setPendingId(normalizedId);
      try {
        await updateBook(book.id, { isFavourite: nextIsFavourite });
      } catch (toggleError) {
        setError(toggleError.message || "Could not update favourite.");
      } finally {
        setPendingId(null);
      }
    },
    [updateBook],
  );

  return { toggle, pendingId, error };
}
