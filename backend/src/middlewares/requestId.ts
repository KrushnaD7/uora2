import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Assigns a correlation/request ID to every request (reusing an incoming
 * header if the client provides one, otherwise generating one) so requests can
 * be traced through logs. Only the ID is surfaced; it carries no sensitive info.
 */
export function requestIdMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const incoming =
    typeof req.headers["x-request-id"] === "string"
      ? req.headers["x-request-id"].trim()
      : "";

  // Restrict incoming IDs to a safe format to avoid log-injection.
  const safeIncoming = /^[A-Za-z0-9._-]{1,64}$/.test(incoming)
    ? incoming
    : "";

  req.requestId = safeIncoming || crypto.randomUUID();
  next();
}
