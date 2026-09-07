import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../errors/ApiError";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * asyncHandler wraps an async Express handler so that rejected promises (and
 * thrown errors) are forwarded to the global error handler instead of becoming
 * unhandled rejections. Express 4 does not forward async errors automatically.
 *
 * Structured errors (subclasses of ApiError) are then translated to the correct
 * HTTP status by error.middleware; anything else yields a 500.
 */
export const asyncHandler = (handler: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

export const isApiError = (err: unknown): err is ApiError =>
  err instanceof ApiError;
