import { Router } from "express";

import {

createUser,
getUsers,
getUserById,
updateUser,
deleteUser

} from "./user.controller";


import { authenticate } from "../../middlewares/auth.middleware";

import { requirePermission } from "../../middlewares/permission.middleware";



const router = Router();



/*
 ADMIN ONLY USER MANAGEMENT
*/


router.post(
  "/",
  authenticate,
  requirePermission("create_user"),
  createUser
);



router.get(
  "/",
  authenticate,
  requirePermission("view_users"),
  getUsers
);



router.get(
  "/:id",
  authenticate,
  requirePermission("view_users"),
  getUserById
);



router.patch(
  "/:id",
  authenticate,
  requirePermission("edit_user"),
  updateUser
);



router.delete(
  "/:id",
  authenticate,
  requirePermission("delete_user"),
  deleteUser
);



export default router;