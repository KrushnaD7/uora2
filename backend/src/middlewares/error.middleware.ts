import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError";
import { env } from "../config/env";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log server-side (safe, no secrets) - only full detail in development
  if (env.NODE_ENV === "production") {
    console.error(`[error] ${req.method} ${req.path} :: ${err?.message}`);
  } else {
    console.error(err);
  }

  // Multer file errors
  if (err instanceof Error && err.name === "MulterError") {
    if (err.message === "File too large") {
      return res.status(413).json({
        success: false,
        message: "File is too large",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Rate limit exceeded (express-rate-limit throws a RateLimitError).
  if (err instanceof Error && err.name === "RateLimitError") {
    return res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  }

  // Custom API Errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Any error carrying an explicit HTTP status code (e.g. 429, 403).
  if (typeof err?.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      success: false,
      message: err?.message || "Request could not be processed",
    });
  }

  // Prisma Invalid UUID
  if (
    err.message &&
    (err.message.includes("Error creating UUID") ||
      err.message.includes("Invalid `prisma")
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Prisma Unique Constraint
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Duplicate record",
    });
  }

  // Prisma Record Not Found
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  // CORS error
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Not allowed by CORS",
    });
  }

  // Unknown Error - never leak internals
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
