import { Request, Response } from "express";
import path from "path";

import { SubmissionService } from "./submission.service";

import { catchAsync } from "../../shared/catchAsync";

import { BadRequestError } from "../../errors/BadRequestError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { NotFoundError } from "../../errors/NotFoundError";
import { resolveUploadPath, ensureFileExists, mimeFromExt, sanitizeDisplayName } from "../../utils/file";
import { prisma } from "../../config/prisma";


const submissionService =
  new SubmissionService();



// Create Submission
export const createSubmission =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {
      if (!req.user) {
        throw new BadRequestError("Unauthorized");
      }

      const status = req.body.status === "DRAFT" ? "DRAFT" : "SUBMITTED";

      const submission =
        await submissionService.createSubmission(
          req.body,
          req.user.id,
          status
        );

      res.status(201).json({
        success: true,
        message: status === "DRAFT" ? "Draft saved successfully" : "Submission created successfully",
        data: submission
      });
    }
  );

// Get My Submissions (Author)
export const getMySubmissions =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {
      if (!req.user) {
        throw new BadRequestError("Unauthorized");
      }

      const submissions =
        await submissionService.getAuthorSubmissions(req.user.id);

      res.status(200).json({
        success: true,
        message: "Your submissions fetched successfully",
        data: submissions
      });
    }
  );





// Get All Submissions
export const getAllSubmissions =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {


      const submissions =
        await submissionService.getAllSubmissions();



      res.status(200).json({

        success:true,

        message:
          "Submissions fetched successfully",

        data: submissions

      });


    }
  );




// Get Submission By ID
export const getSubmissionById =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {
      const submission = await submissionService.getSubmissionById(req.params.id);

      // IDOR Check: Authors can only view their own submissions
      if (req.user?.role === "AUTHOR") {
        const isOwner = submission.authors?.some(a => a.author?.userId === req.user?.id);
        if (!isOwner) {
          throw new ForbiddenError("You do not own this submission");
        }
      }

      // IDOR Check: Reviewers can only view submissions assigned to them
      if (req.user?.role === "REVIEWER") {
        const reviewer = await prisma.reviewer.findFirst({ where: { email: req.user.email } });
        if (!reviewer) {
          throw new BadRequestError("Reviewer profile not found");
        }
        const isAssigned = submission.reviewers?.some(
          (r: any) => r.reviewerId === reviewer.id && r.status !== "DECLINED"
        );
        if (!isAssigned) {
          throw new ForbiddenError("You are not assigned to this submission");
        }
      }

      res.status(200).json({
        success:true,
        message: "Submission fetched successfully",
        data: submission
      });
    }
  );





// Get Reviews for a Submission
export const getSubmissionReviews =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {
      const submission = await submissionService.getSubmissionById(req.params.id);

      // IDOR Check: Authors can only view reviews of their own submissions
      if (req.user?.role === "AUTHOR") {
        const isOwner = submission.authors?.some(a => a.author?.userId === req.user?.id);
        if (!isOwner) {
          throw new ForbiddenError("You do not own this submission");
        }
      }

      // IDOR Check: Reviewers can only view reviews of submissions assigned
      // to them — and (enforced in the service) only their OWN review, never
      // a peer reviewer's identity/comments for the same submission.
      let viewerReviewerId: string | undefined;
      if (req.user?.role === "REVIEWER") {
        const reviewer = await prisma.reviewer.findFirst({ where: { email: req.user.email } });
        if (!reviewer) {
          throw new BadRequestError("Reviewer profile not found");
        }
        const isAssigned = submission.reviewers?.some(
          (r: any) => r.reviewerId === reviewer.id && r.status !== "DECLINED"
        );
        if (!isAssigned) {
          throw new ForbiddenError("You are not assigned to this submission");
        }
        viewerReviewerId = reviewer.id;
      }

      const reviews = await submissionService.getSubmissionReviews(
        req.params.id,
        req.user?.role,
        viewerReviewerId
      );

      res.status(200).json({
        success: true,
        message: "Reviews fetched successfully",
        data: reviews
      });
    }
  );




// Upload Manuscript
export const uploadManuscript =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {
      if (!req.file) {
        throw new BadRequestError("No file uploaded");
      }

      const submission = await submissionService.getSubmissionById(req.params.id);
      
      // IDOR Check: Authors can only upload to their own submissions
      if (req.user?.role === "AUTHOR") {
        const isOwner = submission.authors?.some(a => a.author?.userId === req.user?.id);
        if (!isOwner) {
          throw new ForbiddenError("You do not own this submission");
        }
      }

      const uploadedFile = await submissionService.uploadManuscript(req.params.id, req.file);

      res.status(201).json({
        success:true,
        message: "Manuscript uploaded successfully",
        data: uploadedFile
      });
    }
  );

// Download Manuscript
export const downloadManuscript =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {
      const submission = await submissionService.getSubmissionById(req.params.id);
      
      // IDOR Check: Authors can only download their own submissions
      if (req.user?.role === "AUTHOR") {
        const isOwner = submission.authors?.some(a => a.author?.userId === req.user?.id);
        if (!isOwner) {
          throw new ForbiddenError("You do not own this submission");
        }
      }

      // IDOR Check: Reviewers can only download assigned submissions
      if (req.user?.role === "REVIEWER") {
        const reviewer = await prisma.reviewer.findFirst({ where: { email: req.user.email } });
        if (!reviewer) {
          throw new BadRequestError("Reviewer profile not found");
        }
        const isAssigned = submission.reviewers?.some(
          (r: any) => r.reviewerId === reviewer.id && r.status !== "DECLINED"
        );
        if (!isAssigned) {
          throw new ForbiddenError("You are not assigned to this submission");
        }
      }
      
      if (!submission || !submission.files || submission.files.length === 0) {
        throw new BadRequestError("No manuscript found for this submission");
      }

      const file = submission.files[0];

      const resolvedPath = resolveUploadPath(file.filePath);
      if (!ensureFileExists(resolvedPath)) {
        throw new NotFoundError("Manuscript file not found on server");
      }

      const safeName = sanitizeDisplayName(file.originalName || "manuscript");

      // Prevent browsers from MIME-sniffing uploaded content.
      res.setHeader("X-Content-Type-Options", "nosniff");

      // Inline preview (render inside the browser)
      if (req.query.view === "1") {
        const ext = path.extname(resolvedPath) || ".pdf";
        const mime = mimeFromExt(ext);

        res.setHeader("Content-Type", mime);
        res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);
        return res.sendFile(resolvedPath);
      }

      res.download(resolvedPath, safeName);
    }
  );

// Transition Submission Status
export const transitionSubmissionStatus =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {
      if (!req.user) {
        throw new BadRequestError("Unauthorized");
      }

      const { status, remarks } = req.body;
      const updated = await submissionService.transitionStatus(
        req.params.id,
        status,
        req.user.id,
        req.user.role,
        remarks
      );

      res.status(200).json({
        success: true,
        message: `Submission status transitioned to ${status}`,
        data: updated
      });
    }
  );

// Request Reviewer Assignment
export const requestReviewer =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {
      if (!req.user) {
        throw new BadRequestError("Unauthorized");
      }

      const updated = await submissionService.requestReviewer(
        req.params.id,
        req.user.id
      );

      res.status(200).json({
        success: true,
        message: "Reviewer assignment requested successfully",
        data: updated
      });
    }
  );

// Override Submission Status (Admin Override)
export const overrideSubmissionStatus = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError("Unauthorized");
    }

    const { status, remarks } = req.body;
    const updated = await submissionService.overrideStatus(
      req.params.id,
      status,
      req.user.id,
      remarks
    );

    res.status(200).json({
      success: true,
      message: `Submission status overridden to ${status}`,
      data: updated
    });
  }
);