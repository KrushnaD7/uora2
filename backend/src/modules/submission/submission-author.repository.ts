import { prisma } from "../../config/prisma";
import { AttachAuthorInput } from "./submission-author.validation";

export class SubmissionAuthorRepository {
  // Attach author to submission
  attachAuthor(
    submissionId: string,
    data: AttachAuthorInput
  ) {
    return prisma.submissionAuthor.create({
      data: {
        submissionId,
        authorId: data.authorId,
        authorOrder: data.authorOrder,
        isCorresponding: data.isCorresponding,
      },
    });
  }

  // Get all authors of a submission
  findSubmissionAuthors(submissionId: string) {
    return prisma.submissionAuthor.findMany({
      where: {
        submissionId,
      },
      include: {
        author: true,
      },
      orderBy: {
        authorOrder: "asc",
      },
    });
  }

  // Check if author already attached
  findBySubmissionAndAuthor(
    submissionId: string,
    authorId: string
  ) {
    return prisma.submissionAuthor.findUnique({
      where: {
        submissionId_authorId: {
          submissionId,
          authorId,
        },
      },
    });
  }

  // Find corresponding author
  findCorrespondingAuthor(submissionId: string) {
    return prisma.submissionAuthor.findFirst({
      where: {
        submissionId,
        isCorresponding: true,
      },
    });
  }

  // Remove author from submission
  removeAuthor(
    submissionId: string,
    authorId: string
  ) {
    return prisma.submissionAuthor.delete({
      where: {
        submissionId_authorId: {
          submissionId,
          authorId,
        },
      },
    });
  }
}