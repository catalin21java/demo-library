import { Navigate, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function RequireAuth({ children }) {
  const { isAuthenticated, isHydrated } = useAuth();
  const location = useLocation();

  if (!isHydrated) {
    return (
      <main className="app">
        <p>Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
