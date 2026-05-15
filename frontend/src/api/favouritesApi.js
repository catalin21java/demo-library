import { authFetch, readApiErrorMessage } from "./httpClient.js";

export async function fetchMyFavourites() {
  const response = await authFetch("/favourites");
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to load favourites."));
  }
  const data = await response.json();
  return data.bookIds ?? [];
}

export async function addFavouriteRequest(bookId) {
  const response = await authFetch(`/favourites/${bookId}`, { method: "POST" });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to add favourite."));
  }
  return response.json();
}

export async function removeFavouriteRequest(bookId) {
  const response = await authFetch(`/favourites/${bookId}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to remove favourite."));
  }
}
