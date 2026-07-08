import { Navigate, Route, Routes } from "react-router-dom";

import RequireAdmin from "./components/RequireAdmin";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthProvider";
import { BooksCacheProvider } from "./context/BooksCacheProvider";
import { FavouritesProvider } from "./context/FavouritesProvider";
import { PendingAdminsProvider } from "./context/PendingAdminsProvider";
import BookDetailsPage from "./pages/BookDetailsPage";
import BooksListPage from "./pages/BooksListPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PendingAdminsPage from "./pages/PendingAdminsPage";
import SignupPage from "./pages/SignupPage";
import "./App.css";

function ProtectedRoutes() {
  return (
    <PendingAdminsProvider>
      <Routes>
        <Route path="/books" element={<BooksListPage />} />
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BooksCacheProvider>
        <FavouritesProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books/:id" element={<BookDetailsPage />} />
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
        </FavouritesProvider>
      </BooksCacheProvider>
    </AuthProvider>
  );
}
