import { Router } from "express";


import {
  createSubmission,
  getAllSubmissions,
  getSubmissionById,
  getSubmissionReviews,
  uploadManuscript,
  downloadManuscript,
  getMySubmissions,
  transitionSubmissionStatus,
  requestReviewer,
  overrideSubmissionStatus
} from "./submission.controller";


import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import { upload } from "../../middlewares/upload.middleware";



const router = Router();


// AUTHOR SPECIFIC ROUTES
router.get(
  "/my",
  authenticate,
  requirePermission("view_manuscript"),
  getMySubmissions
);


// ADMIN + EDITOR

router.get(
  "/",
  authenticate,
  requirePermission("view_all_manuscripts"),
  getAllSubmissions
);



router.get(
  "/:id",
  authenticate,
  requirePermission("view_manuscript"),
  getSubmissionById
);

// Get Reviews for a Submission (Author: own only; Editor/Admin: any)
router.get(
  "/:id/reviews",
  authenticate,
  requirePermission("view_review"),
  getSubmissionReviews
);

// Secure Download Route
router.get(
  "/:id/download",
  authenticate,
  requirePermission("download_manuscript"),
  downloadManuscript
);

// Status Transition Route
router.patch(
  "/:id/status",
  authenticate,
  requirePermission("transition_manuscript_status"),
  transitionSubmissionStatus
);

// Admin Override Route
router.patch(
  "/:id/override",
  authenticate,
  requirePermission("override_manuscript_status"),
  overrideSubmissionStatus
);


// AUTHOR

router.post(
  "/",
  authenticate,
  requirePermission("submit_manuscript"),
  createSubmission
);

// Request Reviewer
router.post(
  "/:id/request-reviewer",
  authenticate,
  requirePermission("request_reviewer"),
  requestReviewer
);


// Upload Manuscript

router.post(
  "/:id/upload",
  authenticate,
  requirePermission("upload_manuscript"),
  upload.single("file"),
  uploadManuscript
);



export default router;