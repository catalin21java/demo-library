const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const AUTH_STORAGE_KEY = "library.auth";
export const AUTH_UNAUTHORIZED_EVENT = "library:unauthorized";

let tokenGetter = () => null;

export function setTokenGetter(getter) {
  tokenGetter = getter;
}

function resolveToken() {
  const token = tokenGetter();
  if (token) {
    return token;
  }
  return getStoredAuth()?.token ?? null;
}

export function getStoredAuth() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAuth(auth) {
  if (!auth) {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function readApiErrorMessage(response, fallbackMessage) {
  try {
    const apiError = await response.json();
    return apiError.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function authFetch(path, options = {}) {
  const token = resolveToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && token) {
    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
  }

  return response;
}
