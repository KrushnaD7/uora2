import { Router } from "express";
import * as JournalController from "./journal.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  createJournalSchema,
  updateJournalSchema,
  updateJournalSettingsSchema,
} from "./journal.validation";

const router = Router();

router.get("/", JournalController.getAllJournals);
router.get("/:id", JournalController.getJournalById);

router.post(
  "/",
  authenticate,
  requirePermission("create_journal"),
  validate(createJournalSchema),
  JournalController.createJournal
);

router.patch(
  "/:id",
  authenticate,
  requirePermission("edit_journal"),
  validate(updateJournalSchema),
  JournalController.updateJournal
);

router.patch(
  "/:id/settings",
  authenticate,
  requirePermission("edit_journal"),
  validate(updateJournalSettingsSchema),
  JournalController.updateJournalSettings
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("delete_journal"),
  JournalController.deleteJournal
);

export default router;
