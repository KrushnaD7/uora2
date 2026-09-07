import { prisma } from "../../config/prisma";

export class RevisionRepository {
  create(data: any) {
    return prisma.submissionRevision.create({
      data,
    });
  }

  findAllBySubmission(submissionId: string) {
    return prisma.submissionRevision.findMany({
      where: {
        submissionId,
      },
      orderBy: {
        revisionNumber: "asc",
      },
    });
  }

  findLatestRevision(submissionId: string) {
    return prisma.submissionRevision.findFirst({
      where: {
        submissionId,
      },
      orderBy: {
        revisionNumber: "desc",
      },
    });
  }

  findById(id: string) {
    return prisma.submissionRevision.findUnique({
      where: {
        id,
      },
    });
  }
}