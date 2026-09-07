import { prisma } from "../../config/prisma";
import { CreateReviewInput } from "./review.validation";

export class ReviewRepository {
  create(data: CreateReviewInput) {
    return prisma.review.create({
      data,
    });
  }

  findById(id: string) {
    return prisma.review.findUnique({
      where: {
        id,
      },
      include: {
        submissionReviewer: {
          include: {
            reviewer: true,
            submission: true,
          },
        },
      },
    });
  }

  findBySubmissionReviewerId(
    submissionReviewerId: string
  ) {
    return prisma.review.findUnique({
      where: {
        submissionReviewerId,
      },
    });
  }

  update(id: string, data: Partial<CreateReviewInput>) {
    return prisma.review.update({
      where: {
        id,
      },
      data,
    });
  }
}