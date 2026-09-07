import { Router } from "express";


import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  publishIssue,
  deleteIssue
} from "./issue.controller";


import { authenticate } from "../../middlewares/auth.middleware";

import { requirePermission } from "../../middlewares/permission.middleware";

import validate from "../../middlewares/validate.middleware";

import {
  publishIssueSchema,
} from "./issue.validation";



const router = Router();



// Public routes

router.get(
  "/",
  getAllIssues
);



router.get(
  "/:id",
  getIssueById
);



// ADMIN ONLY

router.post(
  "/",
  authenticate,
  requirePermission("manage_issues"),
  createIssue
);



router.patch(
  "/:id",
  authenticate,
  requirePermission("manage_issues"),
  updateIssue
);


// Publish issue (sets status=PUBLISHED + publishedAt)
router.patch(
  "/:id/publish",
  authenticate,
  requirePermission("manage_issues"),
  validate(publishIssueSchema),
  publishIssue
);



router.delete(
  "/:id",
  authenticate,
  requirePermission("manage_issues"),
  deleteIssue
);



export default router;