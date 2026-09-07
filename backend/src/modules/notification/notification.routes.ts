import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import { getMyNotifications, markAsRead } from "./notification.controller";

const router = Router();

router.get("/", authenticate, requirePermission("view_notifications"), getMyNotifications);
router.patch("/:id/read", authenticate, requirePermission("mark_notifications_read"), markAsRead);

export default router;
