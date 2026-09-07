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

router.get(
  "/journal/:journalId",
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