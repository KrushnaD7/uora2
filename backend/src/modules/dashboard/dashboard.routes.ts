import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";

import { getDashboard } from "./dashboard.controller";

const router = Router();

// Dashboard
router.get(
  "/",
  authenticate,
  requirePermission("view_dashboard"),
  getDashboard
);

export default router;