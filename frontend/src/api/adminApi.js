import { authFetch, readApiErrorMessage } from "./httpClient.js";

export async function fetchPendingAdmins() {
  const response = await authFetch("/admin/pending-admins");
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to load pending admins."));
  }
  return response.json();
}

export async function approvePendingAdminRequest(userId) {
  const response = await authFetch(`/admin/pending-admins/${userId}/approve`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to approve admin."));
  }
  return response.json();
}
