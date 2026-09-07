import { prisma } from "../../config/prisma";

import { RevisionRepository } from "./revision.repository";
import { SubmissionRepository } from "../submission/submission.repository";

import { CreateRevisionInput } from "./revision.validation";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { ForbiddenError } from "../../errors/ForbiddenError";


export class RevisionService {

  constructor(
    private repository = new RevisionRepository(),
    private submissionRepository = new SubmissionRepository()
  ) {}

  async createRevision(
    data: CreateRevisionInput,
    file: Express.Multer.File,
    currentUser: { id: string; email: string; role: string }
  ) {

    // Check submission exists
    const submission =
      await this.submissionRepository.findById(
        data.submissionId
      );

    if (!submission) {
      throw new NotFoundError(
        "Submission not found"
      );
    }

    // Only the owning author may submit a revision.
    if (currentUser.role === "AUTHOR") {
      const isOwner =
        submission.authors?.some(
          (a: any) => a.author?.userId === currentUser.id
        );
      if (!isOwner) {
        throw new ForbiddenError(
          "Unauthorized: You do not own this submission"
        );
      }
    } else if (["EDITOR", "ADMIN", "SUB_ADMIN"].includes(currentUser.role)) {
      // Editors/admins may upload a revision on the author's behalf.
      // Role-based permission already gates access; no extra ownership needed.
    } else {
      throw new ForbiddenError(
        "Unauthorized: You cannot upload a revision"
      );
    }

    // Revision is allowed only when editor requested it
    if (submission.status !== "REVISION_REQUIRED") {
      throw new ConflictError(
        "Revision can only be submitted when revision is requested"
      );
    }

    // Get latest revision number
    const latest =
      await this.repository.findLatestRevision(
        data.submissionId
      );

    const revisionNumber =
      latest
        ? latest.revisionNumber + 1
        : 1;

    // Create revision + update status + history atomically
    const revision = await prisma.$transaction(async (tx) => {

      const created = await tx.submissionRevision.create({
        data: {
          submissionId: data.submissionId,
          revisionNumber,
          remarks: data.remarks,
          filePath: file.path,
          originalName: file.originalname,
          storedName: file.filename,
        },
      });

      await tx.submission.update({
        where: { id: data.submissionId },
        data: { status: "REVISED_SUBMITTED" },
      });

      await tx.submissionStatusHistory.create({
        data: {
          submissionId: data.submissionId,
          status: "REVISED_SUBMITTED",
          remarks: data.remarks || `Revision ${revisionNumber} submitted`,
        },
      });

      return created;
    });

    return revision;
  }

  async getRevisions(
    submissionId: string,
    currentUser: { id: string; email: string; role: string }
  ) {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    if (currentUser.role === "AUTHOR") {
      const isOwner = submission.authors?.some(
        (a: any) => a.author?.userId === currentUser.id
      );
      if (!isOwner) {
        throw new ForbiddenError("Unauthorized: You do not own this submission");
      }
    } else if (currentUser.role === "REVIEWER") {
      const reviewer = await prisma.reviewer.findFirst({
        where: { email: currentUser.email },
      });
      const isAssigned = submission.reviewers?.some(
        (r: any) => r.reviewerId === reviewer?.id && r.status !== "DECLINED"
      );
      if (!isAssigned) {
        throw new ForbiddenError("Unauthorized: You are not assigned to this submission");
      }
    }

    return this.repository.findAllBySubmission(submissionId);
  }
}
