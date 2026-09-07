import fs from "fs";
import path from "path";
import { env } from "../config/env";

/**
 * Safely resolve a stored file path to an absolute path inside the uploads
 * directory. Throws if the resulting path escapes the uploads directory
 * (path traversal protection).
 */
export function resolveUploadPath(storedNameOrPath: string): string {
  const base = path.basename(storedNameOrPath); // strip any directory components
  const resolved = path.resolve(env.uploadsDir, base);
  const uploadsResolved = path.resolve(env.uploadsDir);

  if (!resolved.startsWith(uploadsResolved + path.sep) && resolved !== uploadsResolved) {
    throw new Error("Invalid file path");
  }

  return resolved;
}

export function ensureFileExists(absPath: string): boolean {
  try {
    return fs.existsSync(absPath) && fs.statSync(absPath).isFile();
  } catch {
    return false;
  }
}

export function mimeFromExt(ext: string): string {
  const e = ext.toLowerCase();
  if (e === ".doc") return "application/msword";
  if (e === ".docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/pdf";
}

export function sanitizeDisplayName(name: string): string {
  const base = path.basename(name).replace(/[^\w.\- ]/g, "_");
  return base || "file";
}

/**
 * Remove a physical file if it exists. Silently succeeds if absent.
 */
export function removeUploadIfExists(storedName: string): void {
  try {
    const abs = resolveUploadPath(storedName);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {
    // ignore cleanup errors
  }
}
