import { prisma } from "../../config/prisma";
import { AssignReviewerInput } from "./submission-reviewer.validation";

export class SubmissionReviewerRepository {
  assignReviewer(
  submissionId: string,
  assignedBy: string,
  data: AssignReviewerInput
) {
  return prisma.submissionReviewer.create({
    data: {
      submissionId,
      reviewerId: data.reviewerId,
      assignedBy,

      deadline: data.deadline
        ? new Date(data.deadline)
        : null,

      remarks: data.remarks,
    },
  });
}

  findBySubmissionAndReviewer(
    submissionId: string,
    reviewerId: string
  ) {
    return prisma.submissionReviewer.findUnique({
      where: {
        submissionId_reviewerId: {
          submissionId,
          reviewerId,
        },
      },
    });
  }

  findSubmissionReviewers(submissionId: string) {
    return prisma.submissionReviewer.findMany({
      where: {
        submissionId,
      },
      include: {
        reviewer: true,
      },
      orderBy: {
        assignedAt: "desc",
      },
    });
  }

  removeReviewer(id: string) {
    return prisma.submissionReviewer.delete({
      where: {
        id,
      },
    });
  }

  findById(id: string) {
    return prisma.submissionReviewer.findUnique({
      where: {
        id,
      },
    });
  }

  updateDeadline(id: string, deadline: Date | null) {
    return prisma.submissionReviewer.update({
      where: { id },
      data: { deadline },
    });
  }
}