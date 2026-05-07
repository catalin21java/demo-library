import { useContext } from "react";

import { BooksCacheContext } from "../context/booksCache";

export default function useBooksCache() {
  const context = useContext(BooksCacheContext);
  if (!context) {
    throw new Error("useBooksCache must be used within BooksCacheProvider.");
  }
  return context;
}
