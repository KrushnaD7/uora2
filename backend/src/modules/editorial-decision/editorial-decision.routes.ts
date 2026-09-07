import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";

import validate from "../../middlewares/validate.middleware";


import {
  makeDecision,
  getStatusHistory
} from "./editorial-decision.controller";


import {
  editorialDecisionSchema
} from "./editorial-decision.validation";


import { requirePermission } from "../../middlewares/permission.middleware";

const router = Router();



// Make Editorial Decision

router.patch(

  "/:id/decision",

  authenticate,

  requirePermission("make_editorial_decision"),

  validate(editorialDecisionSchema),

  makeDecision

);



// Get Submission Status History

router.get(

  "/:id/history",

  authenticate,

  requirePermission("view_status_history"),

  getStatusHistory

);



export default router;