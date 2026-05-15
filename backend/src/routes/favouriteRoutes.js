import express from "express";

import * as favouriteController from "../controllers/favouriteController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", favouriteController.getMyFavourites);
router.post("/:bookId", favouriteController.addFavourite);
router.delete("/:bookId", favouriteController.removeFavourite);

export default router;
