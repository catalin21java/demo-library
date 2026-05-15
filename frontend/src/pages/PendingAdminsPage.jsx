import { useState } from "react";
import { Link } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import usePendingAdmins from "../hooks/usePendingAdmins";

export default function PendingAdminsPage() {
  const { pendingAdmins, hasLoaded, isLoading, error, approveAdmin } = usePendingAdmins();
  const [approveError, setApproveError] = useState("");
  const [approvingId, setApprovingId] = useState(null);

  async function handleApprove(userId) {
    setApprovingId(userId);
    setApproveError("");
    try {
      await approveAdmin(userId);
    } catch (approveErr) {
      setApproveError(approveErr.message || "Failed to approve admin.");
    } finally {
      setApprovingId(null);
    }
  }

  const displayError = approveError || error;
  const showLoading = isLoading || (!hasLoaded && !displayError);

  return (
    <main className="app">
      <AppHeader />
      <h1>Pending admin approvals</h1>
      <p>
        <Link to="/books">Back to books</Link>
      </p>
      {displayError ? <p className="error">{displayError}</p> : null}
      {showLoading ? <p>Loading pending admins...</p> : null}
      {hasLoaded && pendingAdmins.length === 0 ? <p>No pending admin accounts.</p> : null}
      {hasLoaded && pendingAdmins.length > 0 ? (
        <table className="book-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingAdmins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.username}</td>
                <td>{new Date(admin.createdAt).toLocaleString()}</td>
                <td className="actions">
                  <button
                    type="button"
                    onClick={() => handleApprove(admin.id)}
                    disabled={approvingId === admin.id}
                  >
                    {approvingId === admin.id ? "Approving..." : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </main>
  );
}
