import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";

import validate from "../../middlewares/validate.middleware";

import {
  publishArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} from "./article.controller";


import {
  publishArticleSchema,
  updateArticleSchema,
} from "./article.validation";


const router = Router();


// Publish Article
router.post(
  "/publish",
  authenticate,
  requirePermission("publish_article"),
  validate(publishArticleSchema),
  publishArticle
);



// Get All Articles
router.get(
  "/",
  authenticate,
  requirePermission("view_article"),
  getAllArticles
);



// Get Article By ID
router.get(
  "/:id",
  authenticate,
  getArticleById
);



// Update Article
router.patch(
  "/:id",
  authenticate,
  requirePermission("edit_article"),
  validate(updateArticleSchema),
  updateArticle
);



// Delete Article
router.delete(
  "/:id",
  authenticate,
  requirePermission("delete_article"),
  deleteArticle
);


export default router;