import { Request, Response } from "express";
import { JournalSuggestionService } from "./journal-suggestion.service";
import { catchAsync } from "../../shared/catchAsync";
import { BadRequestError } from "../../errors/BadRequestError";

const suggestionService = new JournalSuggestionService();

export const createSuggestion = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError("Unauthorized");
    }

    const suggestion = await suggestionService.createSuggestion(
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Journal suggestion submitted successfully",
      data: suggestion,
    });
  }
);

export const getSuggestions = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError("Unauthorized");
    }

    const suggestions = await suggestionService.getSuggestions(
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: "Suggestions fetched successfully",
      data: suggestions,
    });
  }
);

export const getSuggestionById = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError("Unauthorized");
    }

    const suggestion = await suggestionService.getSuggestionById(
      req.params.id,
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: "Suggestion details fetched successfully",
      data: suggestion,
    });
  }
);

export const evaluateSuggestion = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError("Unauthorized");
    }

    const { status, remarks } = req.body;
    const updated = await suggestionService.evaluateSuggestion(
      req.params.id,
      status,
      remarks,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Suggestion evaluation submitted successfully",
      data: updated,
    });
  }
);

export const makeDecision = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError("Unauthorized");
    }

    const { status, remarks } = req.body;
    const updated = await suggestionService.makeDecision(
      req.params.id,
      status,
      remarks,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Decision recorded successfully",
      data: updated,
    });
  }
);
