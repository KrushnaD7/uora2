import { Router } from "express";

import {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
} from "./author.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";

const router = Router();

router.post("/", authenticate, requirePermission("create_user"), createAuthor);
router.get("/", authenticate, requirePermission("view_users"), getAllAuthors);
router.get("/:id", authenticate, requirePermission("view_users"), getAuthorById);
router.patch("/:id", authenticate, requirePermission("edit_user"), updateAuthor);
router.delete("/:id", authenticate, requirePermission("delete_user"), deleteAuthor);

export default router;