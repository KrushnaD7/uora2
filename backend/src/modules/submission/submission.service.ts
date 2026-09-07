import { SubmissionRepository } from "./submission.repository";
import { JournalRepository } from "../journal/journal.repository";
import { CreateSubmissionInput } from "./submission.validation";
import path from "path";

import { NotFoundError } from "../../errors/NotFoundError";
import { prisma } from "../../config/prisma";
import { BadRequestError } from "../../errors/BadRequestError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { logActivity } from "../../utils/logger";
import { createNotification } from "../../utils/notifications";
import { removeUploadIfExists } from "../../utils/file";
import { canTransition } from "../../shared/submission-workflow";

export class SubmissionService {
  constructor(
    private repository = new SubmissionRepository(),
    private journalRepository = new JournalRepository()
  ) {}

  // Create Submission
  async createSubmission(data: CreateSubmissionInput, userId: string, status: "DRAFT" | "SUBMITTED" = "SUBMITTED") {
    // Check Journal Exists
    const journal = await this.journalRepository.findById(data.journalId);

    if (!journal) {
      throw new NotFoundError("Journal not found");
    }

    // Generate Paper ID
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);

    const paperId = `${journal.shortName}-${year}-${random}`;

    // Create the author profile (if needed) and the submission atomically so a
    // later failure never leaves an orphaned author or half-created submission.
    const submission = await prisma.$transaction(async (tx) => {
      let authorForTx = await tx.author.findFirst({
        where: { userId },
      });

      if (!authorForTx) {
        const user = await tx.users.findUnique({ where: { id: userId } });
        if (!user) {
          throw new BadRequestError("Author profile not found for this user");
        }
        authorForTx = await tx.author.create({
          data: {
            userId: user.id,
            fullName: user.name,
            email: user.email,
          },
        });
      }

      return this.repository.create(
        {
          ...data,
          paperId,
          status,
        },
        authorForTx.id,
        tx
      );
    });

    // Create notification
    await createNotification(
      userId,
      "Submission Received",
      `Your manuscript "${data.title}" (ID: ${paperId}) has been successfully submitted.`
    );

    // Log activity
    await logActivity(
      userId,
      "CREATE",
      "submission",
      `Author submitted manuscript "${data.title}" (ID: ${paperId}).`
    );

    return submission;
  }

  // Get All Submissions
  async getAllSubmissions() {
    return this.repository.findAll();
  }

  // Get Author Submissions
  async getAuthorSubmissions(userId: string) {
    let author = await prisma.author.findFirst({
      where: { userId }
    });

    if (!author) {
      const user = await prisma.users.findUnique({ where: { id: userId } });
      if (user) {
        author = await prisma.author.create({
          data: {
            userId: user.id,
            fullName: user.name,
            email: user.email
          }
        });
      } else {
        return [];
      }
    }

    return this.repository.findByAuthor(author.id);
  }

  // Get Submission By ID
  async getSubmissionById(id: string) {
    const submission = await this.repository.findById(id);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    return submission;
  }

  // Get Reviews for a Submission
  async getSubmissionReviews(submissionId: string, role?: string, viewerReviewerId?: string) {
    const reviews = await this.repository.findReviewsBySubmissionId(submissionId);

    if (role === "AUTHOR") {
      // Authors see the review feedback but not the confidential editor comments
      // or the identity of the reviewer (double-blind).
      return reviews.map((r: any) => {
        const { commentsToEditor, submissionReviewer, ...rest } = r;
        return {
          ...rest,
          reviewer: {
            fullName: "Anonymous Reviewer",
          },
        };
      });
    }

    if (role === "REVIEWER") {
      // Reviewer confidentiality: a reviewer must never see another
      // reviewer's identity, comments, or recommendation for the same
      // submission — only their own review. (Editors/Admins still see all.)
      return reviews.filter(
        (r: any) => r.submissionReviewer?.reviewerId === viewerReviewerId
      );
    }

    return reviews;
  }

  // Transition status of a submission (with validation)
  async transitionStatus(id: string, newStatus: any, userId: string, role: string, remarks?: string) {
    const submission = await this.repository.findById(id);
    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    const currentStatus = submission.status;

    // Author-level transitions (e.g. DRAFT -> SUBMITTED) must be owned by the
    // caller. Without this guard, any AUTHOR could transition another author's
    // submission (IDOR).
    if (role === "AUTHOR") {
      const isOwner = submission.authors?.some(
        (a: any) => a.author?.userId === userId
      );
      if (!isOwner) {
        throw new ForbiddenError("You do not own this submission");
      }
    }

    // Use the centralized status transition validator.
    const isValid = canTransition(
      currentStatus as any,
      newStatus as any,
      role
    );

    if (!isValid) {
      throw new BadRequestError(`Invalid status transition from ${currentStatus} to ${newStatus} for role ${role}`);
    }

    // Perform transition, save history, and (when publishing) create the
    // article record — all atomically so no half-completed workflow states
    // are left behind.
    const updated = await prisma.$transaction(async (tx) => {
      const updatedSub = await tx.submission.update({
        where: { id },
        data: { status: newStatus },
      });

      await tx.submissionStatusHistory.create({
        data: {
          submissionId: id,
          status: newStatus,
          remarks: remarks || `Status changed from ${currentStatus} to ${newStatus}`
        }
      });

      // When transitioning to PUBLISHED, auto-create an Article record if one doesn't exist
      if (newStatus === "PUBLISHED") {
        const existingArticle = await tx.article.findUnique({ where: { submissionId: id } });
        if (!existingArticle) {
          // Find or create a Volume for this journal
          const year = new Date().getFullYear();
          let volume = await tx.volume.findFirst({
            where: { journalId: submission.journalId, year },
          });
          if (!volume) {
            const maxVol = await tx.volume.findFirst({
              where: { journalId: submission.journalId },
              orderBy: { volumeNumber: "desc" },
            });
            const nextVolNum = (maxVol?.volumeNumber || 0) + 1;
            volume = await tx.volume.create({
              data: { journalId: submission.journalId, volumeNumber: nextVolNum, year },
            });
          }

          // Find or create an Issue for this volume (use latest issue number)
          let issue = await tx.issue.findFirst({
            where: { volumeId: volume.id },
            orderBy: { issueNumber: "desc" },
          });
          if (!issue) {
            issue = await tx.issue.create({
              data: {
                journalId: submission.journalId,
                volumeId: volume.id,
                issueNumber: 1,
                status: "UPCOMING",
              },
            });
          }

          const doi = `10.5678/uora.${year}.${Date.now()}`;

          // Auto-link the submission's manuscript PDF
          const manuscriptFile = submission.files?.find((f: any) => f.fileType === "MANUSCRIPT");
          const pdfUrl = manuscriptFile ? `/uploads/${path.basename(manuscriptFile.filePath)}` : undefined;

          await tx.article.create({
            data: {
              journalId: submission.journalId,
              issueId: issue.id,
              submissionId: id,
              title: submission.title,
              doi,
              pdfUrl,
              publishedAt: new Date(),
            },
          });
        }
      }

      return updatedSub;
    });

    // Notify Authors
    const submissionAuthors = await prisma.submissionAuthor.findMany({
      where: { submissionId: id },
      include: { author: true }
    });
    for (const sa of submissionAuthors) {
      if (sa.author.userId) {
        await createNotification(
          sa.author.userId,
          `Manuscript Status Updated`,
          `The status of your manuscript "${submission.title}" (ID: ${submission.paperId}) has been updated to ${newStatus}. Remarks: ${remarks || "none"}`
        );
      }
    }

    // Log Activity
    await logActivity(
      userId,
      "UPDATE",
      "submission",
      `User role ${role} transitioned status of submission '${submission.title}' (${submission.paperId}) from ${currentStatus} to ${newStatus}.`
    );

    return updated;
  }

  // Upload Manuscript
  async uploadManuscript(
    submissionId: string,
    file: Express.Multer.File
  ) {
    // Check Submission Exists
    const submission = await this.repository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    // Authors may only upload a manuscript while the submission is still
    // editable (DRAFT or SUBMITTED, before it goes under review).
    if (
      submission.status !== "DRAFT" &&
      submission.status !== "SUBMITTED"
    ) {
      throw new BadRequestError(
        `Manuscript can no longer be changed while submission is in ${submission.status} status`
      );
    }

    try {
      return await this.repository.uploadFile({
        submissionId,
        fileType: "MANUSCRIPT",
        originalName: file.originalname,
        storedName: file.filename,
        filePath: `uploads/${file.filename}`,
        mimeType: file.mimetype,
        fileSize: file.size,
      });
    } catch (error) {
      // If the database write fails, remove the orphan file from disk.
      removeUploadIfExists(file.filename);
      throw error;
    }
  }

  // Request Reviewer
  async requestReviewer(id: string, userId: string) {
    const submission = await this.repository.findById(id);
    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    const author = await prisma.author.findFirst({
      where: { userId }
    });

    if (!author) {
      throw new BadRequestError("Author profile not found for this user");
    }

    const isOwner = submission.authors?.some(a => a.authorId === author.id);
    if (!isOwner) {
      throw new ForbiddenError("You do not own this submission");
    }

    if (submission.status !== "SUBMITTED" && submission.status !== "INITIAL_SCREENING") {
      throw new BadRequestError(`Cannot request reviewer for a paper in ${submission.status} status.`);
    }

    return prisma.submission.update({
      where: { id },
      data: { reviewerRequested: true }
    });
  }

  // Admin Override status
  async overrideStatus(id: string, newStatus: any, userId: string, remarks?: string) {
    const submission = await this.repository.findById(id);
    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    const currentStatus = submission.status;

    const updated = await prisma.$transaction(async (tx) => {
      const updatedSub = await tx.submission.update({
        where: { id },
        data: { status: newStatus },
      });

      await tx.submissionStatusHistory.create({
        data: {
          submissionId: id,
          status: newStatus,
          remarks: remarks || `Admin Override: Status changed from ${currentStatus} to ${newStatus}`
        }
      });

      await tx.activityLog.create({
        data: {
          userId,
          action: "UPDATE",
          module: "submission",
          description: `Admin override status of submission '${submission.title}' (${submission.paperId}) from ${currentStatus} to ${newStatus}. Remarks: ${remarks || "none"}`
        }
      });

      // When overriding to PUBLISHED, auto-create an Article record if one doesn't exist
      if (newStatus === "PUBLISHED") {
        const existingArticle = await tx.article.findUnique({ where: { submissionId: id } });
        if (!existingArticle) {
          const year = new Date().getFullYear();
          let volume = await tx.volume.findFirst({
            where: { journalId: submission.journalId, year },
          });
          if (!volume) {
            const maxVol = await tx.volume.findFirst({
              where: { journalId: submission.journalId },
              orderBy: { volumeNumber: "desc" },
            });
            const nextVolNum = (maxVol?.volumeNumber || 0) + 1;
            volume = await tx.volume.create({
              data: { journalId: submission.journalId, volumeNumber: nextVolNum, year },
            });
          }

          let issue = await tx.issue.findFirst({
            where: { volumeId: volume.id },
            orderBy: { issueNumber: "desc" },
          });
          if (!issue) {
            issue = await tx.issue.create({
              data: {
                journalId: submission.journalId,
                volumeId: volume.id,
                issueNumber: 1,
                status: "UPCOMING",
              },
            });
          }

          const doi = `10.5678/uora.${year}.${Date.now()}`;
          const manuscriptFile = submission.files?.find((f: any) => f.fileType === "MANUSCRIPT");
          const pdfUrl = manuscriptFile ? `/uploads/${path.basename(manuscriptFile.filePath)}` : undefined;

          await tx.article.create({
            data: {
              journalId: submission.journalId,
              issueId: issue.id,
              submissionId: id,
              title: submission.title,
              doi,
              pdfUrl,
              publishedAt: new Date(),
            },
          });
        }
      }

      return updatedSub;
    });

    return updated;
  }
}