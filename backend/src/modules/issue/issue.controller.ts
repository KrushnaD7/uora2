import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { IssueService } from "./issue.service";

const issueService = new IssueService();

// Create Issue
export const createIssue = catchAsync(
  async (req: Request, res: Response) => {
    const issue = await issueService.createIssue(req.body);

    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  }
);

// Get All Issues
export const getAllIssues = catchAsync(
  async (_req: Request, res: Response) => {
    const issues = await issueService.getAllIssues();

    return res.status(200).json({
      success: true,
      message: "Issues fetched successfully",
      data: issues,
    });
  }
);

// Get Issue By ID
export const getIssueById = catchAsync(
  async (req: Request, res: Response) => {
    const issue = await issueService.getIssueById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Issue fetched successfully",
      data: issue,
    });
  }
);

// Update Issue
export const updateIssue = catchAsync(
  async (req: Request, res: Response) => {
    const issue = await issueService.updateIssue(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: issue,
    });
  }
);

// Publish Issue
export const publishIssue = catchAsync(
  async (req: Request, res: Response) => {
    const issue = await issueService.publishIssue(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Issue published successfully",
      data: issue,
    });
  }
);

// Delete Issue
export const deleteIssue = catchAsync(
  async (req: Request, res: Response) => {
    await issueService.deleteIssue(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  }
);