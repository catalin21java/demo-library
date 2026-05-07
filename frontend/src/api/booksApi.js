const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function readApiErrorMessage(response, fallbackMessage) {
  const apiError = await response.json();
  return apiError.message || fallbackMessage;
}

export async function fetchBooks() {
  const response = await fetch(`${apiBaseUrl}/books`);
  if (!response.ok) {
    throw new Error("Failed to load books.");
  }
  return response.json();
}

export async function fetchBookById(id) {
  const response = await fetch(`${apiBaseUrl}/books/${id}`);
  if (response.status === 404) {
    const notFoundError = new Error("Not found");
    notFoundError.status = 404;
    throw notFoundError;
  }
  if (!response.ok) {
    throw new Error("Failed to load book.");
  }
  return response.json();
}

export async function createBookRequest(payload) {
  const response = await fetch(`${apiBaseUrl}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to create book."));
  }
  return response.json();
}

export async function updateBookRequest(id, payload) {
  const response = await fetch(`${apiBaseUrl}/books/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to update book."));
  }
  return response.json();
}

export async function deleteBookRequest(id) {
  const response = await fetch(`${apiBaseUrl}/books/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to delete book."));
  }
}
