import { authFetch, readApiErrorMessage } from "./httpClient.js";

export async function loginRequest({ username, password }) {
  const response = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to log in."));
  }
  return response.json();
}

export async function signupRequest({ username, password, role }) {
  const response = await authFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, password, role }),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to sign up."));
  }
  return response.json();
}
