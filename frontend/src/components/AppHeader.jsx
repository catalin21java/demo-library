import { Link } from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function AppHeader() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="app-header-user">{user?.username}</span>
        <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
      </div>
      <div className="app-header-actions">
        {isAdmin ? (
          <Link to="/admin/pending" className="link-button">
            Pending admins
          </Link>
        ) : null}
        <button type="button" className="btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
