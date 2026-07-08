import express from "express";
import * as bookController from "../controllers/bookController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", bookController.getBooks);
router.get("/:id", bookController.getBook);

router.use(authenticate);

router.post("/", requireAdmin, bookController.createBook);
router.patch("/:id", requireAdmin, bookController.patchBook);
router.delete("/:id", requireAdmin, bookController.deleteBook);

export default router;