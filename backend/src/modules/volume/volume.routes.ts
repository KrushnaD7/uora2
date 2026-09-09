import { Router } from "express";

import {
  createVolume,
  getAllVolumes,
  getVolumesByJournalId,
  getVolumeById,
  updateVolume,
  deleteVolume
} from "./volume.controller";


import { authenticate } from "../../middlewares/auth.middleware";

import { requirePermission } from "../../middlewares/permission.middleware";


const router = Router();



// Public

router.get(
  "/",
  getAllVolumes
);

// Editorial view: returns the full volume tree including UPCOMING issues and
// unpublished articles, so it requires the same permission as editing them.
// The public site reads published-only data from the `public` module.
router.get(
  "/journal/:journalId",
  authenticate,
  requirePermission("manage_volumes"),
  getVolumesByJournalId
);


router.get(
  "/:id",
  getVolumeById
);



// ADMIN ONLY

router.post(
  "/",
  authenticate,
  requirePermission("manage_volumes"),
  createVolume
);



router.patch(
  "/:id",
  authenticate,
  requirePermission("manage_volumes"),
  updateVolume
);



router.delete(
  "/:id",
  authenticate,
  requirePermission("manage_volumes"),
  deleteVolume
);



export default router;