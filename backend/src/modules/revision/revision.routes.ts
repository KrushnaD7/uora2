import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import { upload } from "../../middlewares/upload.middleware";

import {
  uploadRevision,
  getSubmissionRevisions,
} from "./revision.controller";

import { createRevisionSchema } from "./revision.validation";

const router = Router();

// Upload Revision (Author)
router.post(
  "/upload",
  authenticate,
  requirePermission("upload_manuscript"),
  upload.single("revision"),
  validate(createRevisionSchema),
  uploadRevision
);

// Get All Revisions (Author: own only; Editor/Admin; Reviewer: assigned)
router.get(
  "/:submissionId",
  authenticate,
  requirePermission("view_manuscript"),
  getSubmissionRevisions
);

export default router;
