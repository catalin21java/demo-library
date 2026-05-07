import { Navigate, Route, Routes } from "react-router-dom";

import { BooksCacheProvider } from "./context/BooksCacheProvider";
import BookDetailsPage from "./pages/BookDetailsPage";
import BooksListPage from "./pages/BooksListPage";
import "./App.css";

export default function App() {
  return (
    <BooksCacheProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/books" replace />} />
        <Route path="/books" element={<BooksListPage />} />
        <Route path="/books/:id" element={<BookDetailsPage />} />
        <Route path="*" element={<Navigate to="/books" replace />} />
      </Routes>
    </BooksCacheProvider>
  );
}
