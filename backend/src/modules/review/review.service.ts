import { ReviewRepository } from "./review.repository";
import { SubmissionReviewerRepository } from "../submission-reviewer/submission-reviewer.repository";

import { CreateReviewInput } from "./review.validation";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { ForbiddenError } from "../../errors/ForbiddenError";

import { prisma } from "../../config/prisma";

export class ReviewService {
  constructor(
    private repository = new ReviewRepository(),
    private submissionReviewerRepository =
      new SubmissionReviewerRepository()
  ) {}

  // Create Review
  async createReview(data: CreateReviewInput, currentUser: { id: string; email: string; role: string }) {
    // 1. Check assignment exists
    const assignment =
      await this.submissionReviewerRepository.findById(
        data.submissionReviewerId
      );

    if (!assignment) {
      throw new NotFoundError(
        "Reviewer assignment not found"
      );
    }

    // Verify the authenticated user is the reviewer assigned to this submission.
    if (currentUser.role === "REVIEWER") {
      const reviewer = await prisma.reviewer.findFirst({
        where: { email: currentUser.email },
      });
      if (!reviewer || reviewer.id !== assignment.reviewerId) {
        throw new ForbiddenError(
          "Unauthorized: You are not assigned as the reviewer for this submission"
        );
      }
    }

    // 2. Check duplicate review
    const existingReview =
      await this.repository.findBySubmissionReviewerId(
        data.submissionReviewerId
      );

    if (existingReview) {
      throw new ConflictError(
        "Review already submitted"
      );
    }

    // 3. Create review + update assignment status atomically
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data,
      });

      await tx.submissionReviewer.update({
        where: {
          id: data.submissionReviewerId,
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      return created;
    });

    return this.toDto(review, currentUser.role);
  }

  // Get Review
  async getReviewById(id: string, currentUser: { id: string; email: string; role: string }) {
    const review =
      await this.repository.findById(id);

    if (!review) {
      throw new NotFoundError(
        "Review not found"
      );
    }

    // Only the reviewer who authored the review, or an editor/admin, may view it.
    if (currentUser.role === "REVIEWER") {
      const reviewer = await prisma.reviewer.findFirst({
        where: { email: currentUser.email },
      });
      if (!reviewer || review.submissionReviewer?.reviewerId !== reviewer.id) {
        throw new ForbiddenError("Unauthorized: You cannot view this review");
      }
    } else if (currentUser.role === "AUTHOR") {
      // Authors must be owners of the linked submission.
      const submission = await prisma.submission.findFirst({
        where: {
          reviewers: { some: { id: review.submissionReviewerId } },
          authors: { some: { author: { userId: currentUser.id } } },
        },
      });
      if (!submission) {
        throw new ForbiddenError("Unauthorized: You cannot view this review");
      }
    }

    return this.toDto(review, currentUser.role);
  }

  /**
   * Role-aware review DTO. Authors must NEVER receive confidential editor-only
   * comments (blind review). Reviewers/editors/admins get the full review.
   */
  private toDto(review: any, role: string): any {
    if (role === "AUTHOR") {
      const { commentsToEditor: _editorOnly, ...authorVisible } = review;
      return authorVisible;
    }
    return review;
  }


  // Update Review
  async updateReview(
    id: string,
    data: Partial<CreateReviewInput>,
    currentUser: { id: string; email: string; role: string }
  ) {
    const review =
      await this.repository.findById(id);

    if (!review) {
      throw new NotFoundError(
        "Review not found"
      );
    }

    // Only the reviewer who authored the review may update it.
    if (currentUser.role === "REVIEWER") {
      const reviewer = await prisma.reviewer.findFirst({
        where: { email: currentUser.email },
      });
      if (!reviewer || review.submissionReviewer?.reviewerId !== reviewer.id) {
        throw new ForbiddenError(
          "Unauthorized: You can only update your own reviews"
        );
      }
    }

    return this.toDto(
      await this.repository.update(id, data),
      currentUser.role
    );
  }
}