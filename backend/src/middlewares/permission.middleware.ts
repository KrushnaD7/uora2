import {
  Request,
  Response,
  NextFunction
} from "express";

import {
  Permission,
  getPermissionsForRole
} from "../shared/permissions";


/**
 * requirePermission(...permissions)
 *
 * Grants access if the authenticated user's role holds ANY of the
 * listed permissions. ADMIN (super admin) holds every permission.
 *
 * Example: requirePermission("view_manuscript")
 *          requirePermission("assign_reviewer", "unassign_reviewer")
 */
export const requirePermission = (
  ...required: Permission[]
) => {

  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });

    }

    const granted =
      getPermissionsForRole(
        req.user.role
      );

    const missing =
      required.filter(
        (permission) =>
          !granted.includes(permission)
      );

    if (missing.length > 0) {

      return res.status(403).json({
        success: false,
        message: "Forbidden: Missing required permission(s)",
        missingPermissions: missing
      });

    }

    next();

  };

};
