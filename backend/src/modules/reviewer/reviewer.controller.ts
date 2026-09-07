import { Request, Response } from "express";
import path from "path";
import { catchAsync } from "../../shared/catchAsync";
import { ReviewerService } from "./reviewer.service";
import { prisma } from "../../config/prisma";
import { NotFoundError } from "../../errors/NotFoundError";
import { resolveUploadPath, ensureFileExists, mimeFromExt, sanitizeDisplayName } from "../../utils/file";

const reviewerService = new ReviewerService();

// Create Reviewer
export const createReviewer = catchAsync(
  async (req: Request, res: Response) => {
    const reviewer = await reviewerService.createReviewer(req.body);

    return res.status(201).json({
      success: true,
      message: "Reviewer created successfully",
      data: reviewer,
    });
  }
);

// Get All Reviewers
export const getAllReviewers = catchAsync(
  async (_req: Request, res: Response) => {
    const reviewers = await reviewerService.getAllReviewers();

    return res.status(200).json({
      success: true,
      message: "Reviewers fetched successfully",
      data: reviewers,
    });
  }
);

// Get Reviewer By ID
export const getReviewerById = catchAsync(
  async (req: Request, res: Response) => {
    const reviewer = await reviewerService.getReviewerById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Reviewer fetched successfully",
      data: reviewer,
    });
  }
);

// Update Reviewer
export const updateReviewer = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const reviewer = await reviewerService.updateReviewer(
      req.params.id,
      req.body,
      { id: req.user.id, role: req.user.role }
    );

    return res.status(200).json({
      success: true,
      message: "Reviewer updated successfully",
      data: reviewer,
    });
  }
);

// Delete Reviewer
export const deleteReviewer = catchAsync(
  async (req: Request, res: Response) => {
    await reviewerService.deleteReviewer(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Reviewer deleted successfully",
    });
  }
);

// Get Reviewer Applications
export const getApplications = catchAsync(
  async (_req: Request, res: Response) => {
    const applications = await reviewerService.getApplications();

    return res.status(200).json({
      success: true,
      data: applications,
    });
  }
);

// Approve Application
export const approveApplication = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reviewerService.approveApplication(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Application approved successfully",
      data: result,
    });
  }
);

// Reject Application
export const rejectApplication = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reviewerService.rejectApplication(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      data: result,
    });
  }
);

// Get My Assignments (Reviewer)
export const getMyAssignments = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const assignments = await reviewerService.getMyAssignments(req.user.email, req.user.role);

    return res.status(200).json({
      success: true,
      message: "Assignments fetched successfully",
      data: assignments
    });
  }
);

// Download Reviewer Application CV
export const downloadCv = catchAsync(async (req: Request, res: Response) => {
  const application = await prisma.reviewerApplication.findUnique({
    where: { id: req.params.id }
  });

  if (!application || !application.cvFile) {
    throw new NotFoundError("CV file not found for this application");
  }

  const absPath = resolveUploadPath(application.cvFile);
  if (!ensureFileExists(absPath)) {
    throw new NotFoundError("CV file not found on disk");
  }

  const ext = path.extname(application.cvFile) || ".pdf";
  const safeName = sanitizeDisplayName(application.cvFile);

  // Prevent browsers from MIME-sniffing uploaded content.
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.query.inline === "1") {
    const mime = mimeFromExt(ext);
    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);
    return res.sendFile(absPath);
  }

  return res.download(absPath, safeName);
});