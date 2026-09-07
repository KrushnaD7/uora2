import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env";

// Ensure upload directory exists
const uploadPath = env.uploadsDir;

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Sanitize to a safe base name for display purposes (never used for storage path).
export function sanitizeDisplayName(name: string): string {
  // Strip any path segments and control characters
  const base = path.basename(name).replace(/[^\w.\- ]/g, "_");
  return base || "file";
}

// Max upload size: 20 MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },

  filename: (_req, file, cb) => {
    // Generate a server-side filename; never trust the client filename.
    const safeExt = (path.extname(file.originalname) || "").toLowerCase();
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + safeExt;

    cb(null, uniqueName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const ext = (path.extname(file.originalname) || "").toLowerCase();
  const allowedExts = [".pdf", ".doc", ".docx"];

  if (
    allowed.includes(file.mimetype) &&
    allowedExts.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC and DOCX files are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});
