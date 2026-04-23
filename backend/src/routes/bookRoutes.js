import express from "express";
import * as bookController from "../controllers/bookController.js";

const router = express.Router();

router.get("/", bookController.getBooks);
router.post("/", bookController.createBook);
router.patch("/:id", bookController.patchBook);
router.delete("/:id", bookController.deleteBook);

export default router;