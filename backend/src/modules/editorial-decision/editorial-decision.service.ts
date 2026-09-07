import { EditorialDecisionRepository } from "./editorial-decision.repository";
import { SubmissionService } from "../submission/submission.service";
import { SubmissionRepository } from "../submission/submission.repository";
import { EditorialDecisionInput } from "./editorial-decision.validation";
import { NotFoundError } from "../../errors/NotFoundError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { BadRequestError } from "../../errors/BadRequestError";
import { prisma } from "../../config/prisma";

export class EditorialDecisionService {
  private repository: EditorialDecisionRepository;
  private submissionService: SubmissionService;
  private submissionRepository: SubmissionRepository;

  constructor() {
    this.repository = new EditorialDecisionRepository();
    this.submissionService = new SubmissionService();
    this.submissionRepository = new SubmissionRepository();
  }

  async makeDecision(
    submissionId: string,
    data: EditorialDecisionInput,
    userId: string,
    role: string
  ) {
    // Delegate to SubmissionService to run role-based and transition validations (including reviewer checks)
    return this.submissionService.transitionStatus(
      submissionId,
      data.status,
      userId,
      role,
      data.remarks
    );
  }

  async getStatusHistory(
    submissionId: string,
    currentUser: { id: string; email: string; role: string }
  ) {
    const submission = await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    // IDOR guard: this endpoint had no ownership check at all — any
    // authenticated AUTHOR or REVIEWER (both have view_status_history by
    // role) could read ANY submission's status history, including remarks
    // meant only for that submission's own participants. Editors/Admins are
    // unrestricted, matching every other module in this codebase.
    if (currentUser.role === "AUTHOR") {
      const isOwner = submission.authors?.some(
        (a: any) => a.author?.userId === currentUser.id
      );
      if (!isOwner) {
        throw new ForbiddenError("You do not own this submission");
      }
    } else if (currentUser.role === "REVIEWER") {
      const reviewer = await prisma.reviewer.findFirst({
        where: { email: currentUser.email },
      });
      if (!reviewer) {
        throw new BadRequestError("Reviewer profile not found");
      }
      const isAssigned = submission.reviewers?.some(
        (r: any) => r.reviewerId === reviewer.id && r.status !== "DECLINED"
      );
      if (!isAssigned) {
        throw new ForbiddenError("You are not assigned to this submission");
      }
    }

    return this.repository.getStatusHistory(submissionId);
  }
}