import { authFetch, readApiErrorMessage } from "./httpClient.js";

export async function fetchBooks() {
  const response = await authFetch("/books");
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to load books."));
  }
  return response.json();
}

export async function fetchBookById(id) {
  const response = await authFetch(`/books/${id}`);
  if (response.status === 404) {
    const notFoundError = new Error("Not found");
    notFoundError.status = 404;
    throw notFoundError;
  }
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to load book."));
  }
  return response.json();
}

export async function createBookRequest(payload) {
  const response = await authFetch("/books", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to create book."));
  }
  return response.json();
}

export async function updateBookRequest(id, payload) {
  const response = await authFetch(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to update book."));
  }
  return response.json();
}

export async function deleteBookRequest(id) {
  const response = await authFetch(`/books/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to delete book."));
  }
}
