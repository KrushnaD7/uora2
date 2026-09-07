import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import {
  createSuggestion,
  getSuggestions,
  getSuggestionById,
  evaluateSuggestion,
  makeDecision,
} from "./journal-suggestion.controller";

const router = Router();

// Create Suggestion (Author only)
router.post(
  "/",
  authenticate,
  requirePermission("create_suggestion"),
  createSuggestion
);

// Get All Suggestions (Admin/Editor see all, Author sees own)
router.get(
  "/",
  authenticate,
  requirePermission("view_suggestions"),
  getSuggestions
);

// Get Details
router.get(
  "/:id",
  authenticate,
  requirePermission("view_suggestions"),
  getSuggestionById
);

// Editor Evaluation (Editor/Admin)
router.patch(
  "/:id/evaluate",
  authenticate,
  requirePermission("evaluate_suggestion"),
  evaluateSuggestion
);

// Admin Decision (Admin only)
router.patch(
  "/:id/decision",
  authenticate,
  requirePermission("decide_suggestion"),
  makeDecision
);

export default router;
