import { prisma } from "../../config/prisma";
import {
  CreateReviewerInput,
  UpdateReviewerInput,
} from "./reviewer.validation";

export class ReviewerRepository {
  // Create Reviewer
  create(data: CreateReviewerInput) {
    return prisma.reviewer.create({
      data,
    });
  }

  // Get All Reviewers
  findAll() {
    return prisma.reviewer.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get Reviewer By ID
  findById(id: string) {
    return prisma.reviewer.findUnique({
      where: {
        id,
      },
    });
  }

  // Find Reviewer By Email
  findByEmail(email: string) {
    return prisma.reviewer.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  // Update Reviewer
  update(
    id: string,
    data: UpdateReviewerInput
  ) {
    return prisma.reviewer.update({
      where: {
        id,
      },
      data,
    });
  }

  // Soft Delete Reviewer
  softDelete(id: string) {
    return prisma.reviewer.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}