import {
  Request,
  Response,
  NextFunction
} from "express";

import {
  verifyToken
} from "../utils/jwt";

import {
  Permission,
  getPermissionsForRole
} from "../shared/permissions";

import { prisma } from "../config/prisma";


declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions: Permission[];
      };
    }
  }
}


/**
 * authenticate
 *
 * Verifies the Bearer JWT, then re-reads the user from the database so that
 * authorization decisions never trust a stale JWT alone. This guarantees:
 *   - deleted users are rejected immediately;
 *   - users who are INACTIVE/BLOCKED cannot keep acting with an old token;
 *   - the role used for permission checks is the CURRENT database role, so a
 *     just-demoted/just-promoted user sees the new permissions right away.
 *
 * A single indexed primary-key lookup per request is an acceptable cost for
 * keeping authorization in sync with account state.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = "";
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
      return;
    }

    const decoded = verifyToken(token);

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      res.status(401).json({
        success: false,
        message: "Account is inactive or revoked. Please log in again."
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions:
        getPermissionsForRole(
          user.role
        ) as Permission[],
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
