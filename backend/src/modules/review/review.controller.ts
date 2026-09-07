import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ReviewService } from "./review.service";

const reviewService = new ReviewService();

// Create Review
export const createReview = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const review = await reviewService.createReview(
      req.body,
      { id: req.user.id, email: req.user.email, role: req.user.role }
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  }
);

// Get Review
export const getReviewById = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const review = await reviewService.getReviewById(
      req.params.id,
      { id: req.user.id, email: req.user.email, role: req.user.role }
    );

    return res.status(200).json({
      success: true,
      message: "Review fetched successfully",
      data: review,
    });
  }
);

// Update Review
export const updateReview = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const review = await reviewService.updateReview(
      req.params.id,
      req.body,
      { id: req.user.id, email: req.user.email, role: req.user.role }
    );

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  }
);
