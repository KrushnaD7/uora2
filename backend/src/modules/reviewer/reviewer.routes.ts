import { Router } from "express";

import {
  createReviewer,
  getAllReviewers,
  getReviewerById,
  updateReviewer,
  deleteReviewer,
  getApplications,
  approveApplication,
  rejectApplication,
  getMyAssignments,
  downloadCv
} from "./reviewer.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import validate from "../../middlewares/validate.middleware";
import { createReviewerSchema, updateReviewerSchema } from "./reviewer.validation";

const router = Router();

// Get My Assignments (Reviewer)
router.get(
  "/my/assignments",
  authenticate,
  requirePermission("view_reviewer_assignments"),
  getMyAssignments
);

// Reviewer Applications (Must be before /:id)
router.get(
  "/applications",
  authenticate,
  requirePermission("view_reviewer_applications"),
  getApplications
);

router.get(
  "/applications/:id/cv",
  authenticate,
  requirePermission("view_reviewer_applications"),
  downloadCv
);

router.post(
  "/applications/:id/approve",
  authenticate,
  requirePermission("approve_reviewer_application"),
  approveApplication
);

router.post(
  "/applications/:id/reject",
  authenticate,
  requirePermission("reject_reviewer_application"),
  rejectApplication
);

// Create Reviewer
router.post(
  "/",
  authenticate,
  requirePermission("edit_reviewer"),
  validate(createReviewerSchema),
  createReviewer
);

// Get All Reviewers
router.get(
  "/",
  authenticate,
  requirePermission("view_reviewers"),
  getAllReviewers
);

// Get Reviewer By ID
router.get(
  "/:id",
  authenticate,
  requirePermission("view_reviewers"),
  getReviewerById
);

// Update Reviewer
router.patch(
  "/:id",
  authenticate,
  requirePermission("edit_reviewer"),
  validate(updateReviewerSchema),
  updateReviewer
);

// Delete Reviewer
router.delete(
  "/:id",
  authenticate,
  requirePermission("delete_reviewer"),
  deleteReviewer
);

export default router;