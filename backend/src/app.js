import express from "express";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import favouriteRoutes from "./routes/favouriteRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/books", bookRoutes);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  res.status(statusCode).json({
    message: error.message || "Unexpected server error.",
  });
});

export default app;
