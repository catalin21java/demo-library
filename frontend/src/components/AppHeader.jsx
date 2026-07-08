import { Link } from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function AppHeader() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header-left">
        {isAuthenticated ? (
          <>
            <span className="app-header-user">{user?.username}</span>
            <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          </>
        ) : (
          <Link to="/" className="app-header-brand">
            Library
          </Link>
        )}
      </div>
      <div className="app-header-actions">
        {isAuthenticated ? (
          <>
            <Link to="/books" className="link-button">
              My books
            </Link>
            {isAdmin ? (
              <Link to="/admin/pending" className="link-button">
                Pending admins
              </Link>
            ) : null}
            <button type="button" className="btn-secondary" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="link-button">
              Log in
            </Link>
            <Link to="/signup" className="btn-secondary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
