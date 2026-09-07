import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { SubmissionReviewerService } from "./submission-reviewer.service";

const submissionReviewerService = new SubmissionReviewerService();

// Assign Reviewer
export const assignReviewer = catchAsync(
  async (req: Request, res: Response) => {
    const assignment =
      await submissionReviewerService.assignReviewer(
        req.params.submissionId,
        req.user!.id,
        req.body
      );

    return res.status(201).json({
      success: true,
      message: "Reviewer assigned successfully",
      data: assignment,
    });
  }
);

// Get Submission Reviewers
export const getSubmissionReviewers = catchAsync(
  async (req: Request, res: Response) => {
    const reviewers =
      await submissionReviewerService.getSubmissionReviewers(
        req.params.submissionId,
        { id: req.user!.id, email: req.user!.email, role: req.user!.role }
      );

    return res.status(200).json({
      success: true,
      message: "Submission reviewers fetched successfully",
      data: reviewers,
    });
  }
);

// Update Assignment Deadline
export const updateAssignmentDeadline = catchAsync(
  async (req: Request, res: Response) => {
    const deadline = req.body.deadline ? new Date(req.body.deadline) : null;
    const updated = await submissionReviewerService.updateDeadline(
      req.params.id,
      deadline
    );

    return res.status(200).json({
      success: true,
      message: "Deadline updated successfully",
      data: updated,
    });
  }
);

// Remove Reviewer
export const removeReviewer = catchAsync(
  async (req: Request, res: Response) => {
    await submissionReviewerService.removeReviewer(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Reviewer removed successfully",
    });
  }
);