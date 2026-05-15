import express from "express";
import cors from "cors";
import bookRoutes from "./routes/bookRoutes.js"

const app = express();

app.use(cors());
app.use(express.json());


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
