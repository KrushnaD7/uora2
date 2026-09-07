import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { SubmissionAuthorService } from "./submission-author.service";

const submissionAuthorService = new SubmissionAuthorService();

// Attach Author to Submission
export const attachAuthor = catchAsync(
  async (req: Request, res: Response) => {
    const author = await submissionAuthorService.attachAuthor(
      req.params.submissionId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Author attached successfully",
      data: author,
    });
  }
);

// Get All Authors of a Submission
export const getSubmissionAuthors = catchAsync(
  async (req: Request, res: Response) => {
    const authors = await submissionAuthorService.getSubmissionAuthors(
      req.params.submissionId
    );

    return res.status(200).json({
      success: true,
      message: "Submission authors fetched successfully",
      data: authors,
    });
  }
);

// Remove Author from Submission
export const removeAuthor = catchAsync(
  async (req: Request, res: Response) => {
    await submissionAuthorService.removeAuthor(
      req.params.submissionId,
      req.params.authorId
    );

    return res.status(200).json({
      success: true,
      message: "Author removed successfully",
    });
  }
);