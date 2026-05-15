import { useCallback, useEffect, useMemo, useState } from "react";

import {
  addFavouriteRequest,
  fetchMyFavourites,
  removeFavouriteRequest,
} from "../api/favouritesApi";
import useAuth from "../hooks/useAuth";
import { FavouritesContext } from "./favourites";

export function FavouritesProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [favouriteIds, setFavouriteIds] = useState(() => new Set());
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFavourites() {
      if (!isAuthenticated) {
        if (!cancelled) {
          setFavouriteIds(new Set());
        }
        return;
      }

      try {
        const bookIds = await fetchMyFavourites();
        if (!cancelled) {
          setFavouriteIds(new Set(bookIds.map((id) => String(id))));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Failed to load favourites.");
        }
      }
    }

    void loadFavourites();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const isFavourite = useCallback(
    (bookId) => favouriteIds.has(String(bookId)),
    [favouriteIds],
  );

  const toggleFavourite = useCallback(
    async (book) => {
      const normalizedId = String(book.id);
      setError("");
      setPendingId(normalizedId);

      const wasFavourite = favouriteIds.has(normalizedId);
      const nextIds = new Set(favouriteIds);
      if (wasFavourite) {
        nextIds.delete(normalizedId);
      } else {
        nextIds.add(normalizedId);
      }
      setFavouriteIds(nextIds);

      try {
        if (wasFavourite) {
          await removeFavouriteRequest(normalizedId);
        } else {
          await addFavouriteRequest(normalizedId);
        }
      } catch (toggleError) {
        setFavouriteIds(favouriteIds);
        setError(toggleError.message || "Could not update favourite.");
      } finally {
        setPendingId(null);
      }
    },
    [favouriteIds],
  );

  const reloadFavourites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavouriteIds(new Set());
      return;
    }
    setError("");
    try {
      const bookIds = await fetchMyFavourites();
      setFavouriteIds(new Set(bookIds.map((id) => String(id))));
    } catch (loadError) {
      setError(loadError.message || "Failed to load favourites.");
    }
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      favouriteIds,
      error,
      pendingId,
      isFavourite,
      toggleFavourite,
      reloadFavourites,
    }),
    [favouriteIds, error, pendingId, isFavourite, toggleFavourite, reloadFavourites],
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}
