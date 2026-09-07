import { SubmissionReviewerRepository } from "./submission-reviewer.repository";
import { SubmissionRepository } from "../submission/submission.repository";
import { ReviewerRepository } from "../reviewer/reviewer.repository";

import { AssignReviewerInput } from "./submission-reviewer.validation";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { BadRequestError } from "../../errors/BadRequestError";
import { prisma } from "../../config/prisma";
import { createNotification } from "../../utils/notifications";
import { logActivity } from "../../utils/logger";

export class SubmissionReviewerService {
  constructor(
    private repository = new SubmissionReviewerRepository(),
    private submissionRepository = new SubmissionRepository(),
    private reviewerRepository = new ReviewerRepository()
  ) {}

  async assignReviewer(
    submissionId: string,
    adminId: string,
    data: AssignReviewerInput
  ) {
    const submission = await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    const reviewer = await this.reviewerRepository.findById(data.reviewerId);

    if (!reviewer || reviewer.deletedAt) {
      throw new NotFoundError("Reviewer not found");
    }

    const alreadyAssigned =
      await this.repository.findBySubmissionAndReviewer(
        submissionId,
        data.reviewerId
      );

    if (alreadyAssigned) {
      throw new ConflictError("Reviewer already assigned");
    }

    const result = await this.repository.assignReviewer(
      submissionId,
      adminId,
      data
    );

    // Notify Reviewer User
    const reviewerUser = await prisma.users.findUnique({
      where: { email: reviewer.email }
    });
    if (reviewerUser) {
      await createNotification(
        reviewerUser.id,
        "New Review Assignment",
        `You have been assigned to review the manuscript "${submission.title}" (ID: ${submission.paperId}). Deadline: ${data.deadline ? new Date(data.deadline).toLocaleDateString() : "None"}.`
      );
    }

    // Notify Authors
    const submissionAuthors = await prisma.submissionAuthor.findMany({
      where: { submissionId },
      include: { author: true }
    });
    for (const sa of submissionAuthors) {
      if (sa.author.userId) {
        await createNotification(
          sa.author.userId,
          "Reviewer Assigned",
          `A reviewer has been assigned to your manuscript "${submission.title}" (ID: ${submission.paperId}).`
        );
      }
    }

    // Log Activity
    await logActivity(
      adminId,
      "CREATE",
      "submission-reviewer",
      `Assigned reviewer ${reviewer.fullName} to manuscript '${submission.title}' (${submission.paperId}).`
    );

    return result;
  }

  async getSubmissionReviewers(
    submissionId: string,
    currentUser: { id: string; email: string; role: string }
  ) {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    const assignments = await this.repository.findSubmissionReviewers(submissionId);

    // Both AUTHOR and REVIEWER hold view_reviewer_assignments by role (they
    // need to know assignment status), but the raw query includes full
    // Reviewer records (name, email, mobile, institution) for EVERY reviewer
    // on the submission — an IDOR (no ownership/assignment check at all) that
    // also breaks blind review by exposing reviewer identities. Editors/
    // Admins are unrestricted; Authors and Reviewers get a scoped, redacted
    // view consistent with how reviews themselves are anonymized elsewhere.
    if (currentUser.role === "AUTHOR") {
      const isOwner = submission.authors?.some(
        (a: any) => a.author?.userId === currentUser.id
      );
      if (!isOwner) {
        throw new ForbiddenError("You do not own this submission");
      }
      // Status only — never the reviewer's identity (double-blind).
      return assignments.map((a: any) => ({
        id: a.id,
        status: a.status,
        assignedAt: a.assignedAt,
        acceptedAt: a.acceptedAt,
        completedAt: a.completedAt,
        deadline: a.deadline,
      }));
    }

    if (currentUser.role === "REVIEWER") {
      const reviewer = await prisma.reviewer.findFirst({
        where: { email: currentUser.email },
      });
      if (!reviewer) {
        throw new BadRequestError("Reviewer profile not found");
      }
      const own = assignments.filter((a: any) => a.reviewerId === reviewer.id);
      if (own.length === 0) {
        throw new ForbiddenError("You are not assigned to this submission");
      }
      // Only their own assignment — never a peer reviewer's identity.
      return own;
    }

    return assignments;
  }

  async updateDeadline(id: string, deadline: Date | null) {
    const assignment = await this.repository.findById(id);
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }
    return this.repository.updateDeadline(id, deadline);
  }

  async removeReviewer(id: string) {
    const assignment = await this.repository.findById(id);

    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    const result = await this.repository.removeReviewer(id);

    // Log Activity
    await logActivity(
      assignment.assignedBy,
      "DELETE",
      "submission-reviewer",
      `Removed reviewer assignment ${id} for submission ${assignment.submissionId}.`
    );

    return result;
  }
}