import { useContext } from "react";

import { FavouritesContext } from "../context/favourites";

export default function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error("useFavourites must be used within FavouritesProvider.");
  }
  return context;
}
