import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { BadRequestError } from "../../errors/BadRequestError";
import { RevisionService } from "./revision.service";

const revisionService = new RevisionService();

// Upload Revision
export const uploadRevision = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError("No revision file uploaded");
    }

    const { submissionId } = req.body;
    if (!submissionId) {
      throw new BadRequestError("submissionId is required");
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const revision = await revisionService.createRevision(
      req.body,
      req.file,
      { id: req.user.id, email: req.user.email, role: req.user.role }
    );

    return res.status(201).json({
      success: true,
      message: "Revision uploaded successfully",
      data: revision,
    });
  }
);

// Get Submission Revisions
export const getSubmissionRevisions = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const revisions =
      await revisionService.getRevisions(
        req.params.submissionId,
        { id: req.user.id, email: req.user.email, role: req.user.role }
      );

    return res.status(200).json({
      success: true,
      message: "Revisions fetched successfully",
      data: revisions,
    });
  }
);
