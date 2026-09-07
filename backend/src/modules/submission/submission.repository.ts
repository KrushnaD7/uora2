import { prisma } from "../../config/prisma";
import { CreateSubmissionInput } from "./submission.validation";

export class SubmissionRepository {
  create(
    data: CreateSubmissionInput & { paperId: string; status?: "DRAFT" | "SUBMITTED" },
    authorId: string,
    tx: Pick<typeof prisma, "submission"> = prisma
  ) {
    return tx.submission.create({
      data: {
        journalId: data.journalId,
        paperId: data.paperId,
        title: data.title,
        abstract: data.abstract,
        correspondingEmail: data.correspondingEmail,
        correspondingPhone: data.correspondingPhone || null,
        status: data.status || "DRAFT",
        authors: {
          create: {
            authorId: authorId,
            authorOrder: 1,
            isCorresponding: true
          }
        }
      },
      include: {
        journal: true,
        authors: {
          include: {
            author: true
          }
        },
        files: true
      }
    });
  }

  findAll() {
    return prisma.submission.findMany({
      include: {
        journal: true,
        authors: {
          include: {
            author: true
          }
        },
        files: true
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findByAuthor(authorId: string) {
    return prisma.submission.findMany({
      where: {
        authors: {
          some: {
            authorId
          }
        }
      },
      include: {
        journal: true,
        authors: {
          include: {
            author: true
          }
        },
        files: true
      },
      orderBy: {
        createdAt: "desc",
      }
    });
  }

  findById(id: string) {
    return prisma.submission.findUnique({
      where: {
        id,
      },
      include: {
        journal: true,
        authors: {
          include: {
            author: true
          }
        },
        files: true,
        revisions: true,
        reviewers: true
      },
    });
  }

  findByPaperId(paperId: string) {
    return prisma.submission.findUnique({
      where: {
        paperId,
      },
    });
  }

  findReviewsBySubmissionId(submissionId: string) {
    return prisma.review.findMany({
      where: {
        submissionReviewer: {
          submissionId
        }
      },
      include: {
        submissionReviewer: {
          include: {
            reviewer: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  updateStatus(id: string, status: any) {
    return prisma.submission.update({
      where: { id },
      data: { status }
    });
  }

  // NEW
  uploadFile(data: {
    submissionId: string;
    fileType: "MANUSCRIPT" | "REVISION" | "SUPPLEMENTARY";
    originalName: string;
    storedName: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
  }) {
    return prisma.submissionFile.create({
      data,
    });
  }
}