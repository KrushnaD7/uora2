import { Router } from "express";


import {
  createReview,
  getReviewById,
  updateReview
} from "./review.controller";


import { authenticate } from "../../middlewares/auth.middleware";

import { requirePermission } from "../../middlewares/permission.middleware";

import validate from "../../middlewares/validate.middleware";

import { createReviewSchema, updateReviewSchema } from "./review.validation";


const router = Router();



// Reviewer submits review

router.post(
  "/",
  authenticate,
  requirePermission("submit_review"),
  validate(createReviewSchema),
  createReview
);



// ADMIN + EDITOR + REVIEWER

router.get(
  "/:id",
  authenticate,
  requirePermission("view_review"),
  getReviewById
);



// Reviewer updates review

router.patch(
  "/:id",
  authenticate,
  requirePermission("update_review"),
  validate(updateReviewSchema),
  updateReview
);



export default router;