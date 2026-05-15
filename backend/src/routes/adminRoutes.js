import express from "express";

import * as adminController from "../controllers/adminController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get("/pending-admins", adminController.getPendingAdmins);
router.post("/pending-admins/:id/approve", adminController.approvePendingAdmin);

export default router;
