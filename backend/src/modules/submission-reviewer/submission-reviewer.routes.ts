import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";

import {
  assignReviewer,
  getSubmissionReviewers,
  removeReviewer,
  updateAssignmentDeadline,
} from "./submission-reviewer.controller";

import { assignReviewerSchema } from "./submission-reviewer.validation";

const router = Router();

// Assign Reviewer
router.post(
  "/:submissionId/reviewers",
  authenticate,
  requirePermission("assign_reviewer"),
  validate(assignReviewerSchema),
  assignReviewer
);

// Get Submission Reviewers
router.get(
  "/:submissionId/reviewers",
  authenticate,
  requirePermission("view_reviewer_assignments"),
  getSubmissionReviewers
);

// Remove Reviewer Assignment
router.delete(
  "/assignments/:id",
  authenticate,
  requirePermission("unassign_reviewer"),
  removeReviewer
);

// Update Assignment Deadline
router.patch(
  "/assignments/:id",
  authenticate,
  requirePermission("assign_reviewer"),
  updateAssignmentDeadline
);

export default router;