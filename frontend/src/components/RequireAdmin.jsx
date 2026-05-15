import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function RequireAdmin({ children }) {
  const { isAdmin, isHydrated } = useAuth();

  if (!isHydrated) {
    return (
      <main className="app">
        <p>Loading...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/books" replace />;
  }

  return children;
}
