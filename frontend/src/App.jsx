import { Navigate, Route, Routes } from "react-router-dom";

import RequireAdmin from "./components/RequireAdmin";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthProvider";
import { BooksCacheProvider } from "./context/BooksCacheProvider";
import { FavouritesProvider } from "./context/FavouritesProvider";
import { PendingAdminsProvider } from "./context/PendingAdminsProvider";
import BookDetailsPage from "./pages/BookDetailsPage";
import BooksListPage from "./pages/BooksListPage";
import LoginPage from "./pages/LoginPage";
import PendingAdminsPage from "./pages/PendingAdminsPage";
import SignupPage from "./pages/SignupPage";
import "./App.css";

function ProtectedRoutes() {
  return (
    <BooksCacheProvider>
      <FavouritesProvider>
        <PendingAdminsProvider>
        <Routes>
          <Route path="/books" element={<BooksListPage />} />
          <Route path="/books/:id" element={<BookDetailsPage />} />
          <Route
            path="/admin/pending"
            element={
              <RequireAdmin>
                <PendingAdminsPage />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
        </PendingAdminsProvider>
      </FavouritesProvider>
    </BooksCacheProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ProtectedRoutes />
            </RequireAuth>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
