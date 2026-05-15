import { useCallback, useState } from "react";

import useBooksCache from "./useBooksCache";

/**
 * @param {string} fieldKey - API payload key (e.g. "isFavourite", "rating")
 * @param {string} fallbackMessage
 */
export default function useBookFieldUpdate(fieldKey, fallbackMessage) {
  const { updateBook } = useBooksCache();
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState("");

  const updateField = useCallback(
    async (book, fieldValue) => {
      const normalizedId = String(book.id);
      setError("");
      setPendingId(normalizedId);
      try {
        await updateBook(book.id, { [fieldKey]: fieldValue });
      } catch (updateError) {
        setError(updateError.message || fallbackMessage);
      } finally {
        setPendingId(null);
      }
    },
    [updateBook, fieldKey, fallbackMessage],
  );

  return { updateField, pendingId, error };
}
