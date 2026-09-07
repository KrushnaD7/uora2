import { ReviewerRepository } from "./reviewer.repository";
import {
  CreateReviewerInput,
  UpdateReviewerInput,
} from "./reviewer.validation";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { prisma } from "../../config/prisma";
import bcrypt from "bcrypt";

export class ReviewerService {
  constructor(
    private repository = new ReviewerRepository()
  ) {}

  // Create Reviewer
  async createReviewer(data: CreateReviewerInput) {
    const exists = await this.repository.findByEmail(data.email);

    if (exists) {
      throw new ConflictError(
        "Reviewer email already exists"
      );
    }

    return this.repository.create(data);
  }

  // Get All Reviewers
  async getAllReviewers() {
    return this.repository.findAll();
  }

  // Get Reviewer By ID
  async getReviewerById(id: string) {
    const reviewer = await this.repository.findById(id);

    if (!reviewer || reviewer.deletedAt) {
      throw new NotFoundError(
        "Reviewer not found"
      );
    }

    return reviewer;
  }

  // Update Reviewer
  async updateReviewer(
    id: string,
    data: UpdateReviewerInput,
    currentUser: { id: string; role: string }
  ) {
    const reviewer = await this.repository.findById(id);

    if (!reviewer || reviewer.deletedAt) {
      throw new NotFoundError(
        "Reviewer not found"
      );
    }

    // A reviewer may only update their own profile unless admin/editor.
    if (currentUser.role === "REVIEWER") {
      const linkedUser = await prisma.users.findUnique({
        where: { email: reviewer.email },
      });
      if (!linkedUser || linkedUser.id !== currentUser.id) {
        throw new ForbiddenError(
          "Unauthorized: You can only update your own reviewer profile"
        );
      }
    }

    return this.repository.update(id, data);
  }

  // Delete Reviewer
  async deleteReviewer(id: string) {
    const reviewer = await this.repository.findById(id);

    if (!reviewer) {
      throw new NotFoundError("Reviewer not found");
    }

    return this.repository.softDelete(id);
  }

  async getApplications() {
    return prisma.reviewerApplication.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { journal: { select: { name: true } } }
    });
  }

  async getApplicationById(id: string) {
    const application = await prisma.reviewerApplication.findUnique({
      where: { id },
    });
    if (!application) {
      throw new NotFoundError("Application not found");
    }
    return application;
  }

  async approveApplication(id: string) {
    const application = await prisma.reviewerApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundError("Application not found");
    if (application.status !== "PENDING") throw new ConflictError("Application is not pending");

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({ where: { email: application.email } });
    if (existingUser) throw new ConflictError("A user with this email already exists");

    // Generate random password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.$transaction(async (tx) => {
      // 1. Update application status
      await tx.reviewerApplication.update({
        where: { id },
        data: { status: "APPROVED" }
      });

      // 2. Create User account
      await tx.users.create({
        data: {
          name: application.fullName,
          email: application.email,
          password: hashedPassword,
          role: "REVIEWER"
        }
      });

      // 3. Create Reviewer profile
      await tx.reviewer.create({
        data: {
          fullName: application.fullName,
          email: application.email,
          mobile: application.mobile,
          institution: application.institution,
          designation: application.designation,
          expertise: application.expertise
        }
      });
    });

    // The temporary password is returned once so the admin can hand it to the
    // approved reviewer to set up their account. It is never logged.
    return { success: true, email: application.email, tempPassword };
  }

  async rejectApplication(id: string) {
    const application = await prisma.reviewerApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundError("Application not found");
    if (application.status !== "PENDING") throw new ConflictError("Application is not pending");

    await prisma.reviewerApplication.update({
      where: { id },
      data: { status: "REJECTED" }
    });
    return { success: true };
  }

  async getMyAssignments(email: string, role: string) {
    // Only reviewers may view their own assignments.
    if (role !== "REVIEWER" && role !== "ADMIN" && role !== "EDITOR" && role !== "SUB_ADMIN") {
      throw new ForbiddenError("Unauthorized: Not a reviewer");
    }

    let reviewer = await prisma.reviewer.findFirst({
      where: { email, deletedAt: null }
    });

    if (!reviewer) {
      const user = await prisma.users.findUnique({ where: { email } });
      if (user && (user.role === "REVIEWER" || user.role === "ADMIN" || user.role === "EDITOR" || user.role === "SUB_ADMIN")) {
        const deleted = await prisma.reviewer.findFirst({ where: { email } });
        if (deleted) {
          reviewer = await prisma.reviewer.update({
            where: { id: deleted.id },
            data: { deletedAt: null, isActive: true }
          });
        } else {
          reviewer = await prisma.reviewer.create({
            data: {
              fullName: user.name,
              email: user.email,
              isActive: true
            }
          });
        }
      } else {
        throw new NotFoundError("Reviewer profile not found");
      }
    }

    return prisma.submissionReviewer.findMany({
      where: { reviewerId: reviewer.id },
      include: {
        submission: {
          include: {
            journal: true,
            files: true
          }
        },
        review: true
      },
      orderBy: { assignedAt: "desc" }
    });
  }
}
