import { prisma } from "../../config/prisma";
import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";
import { createNotification } from "../../utils/notifications";
import { logActivity } from "../../utils/logger";
import { JournalSuggestionStatus } from "@prisma/client";

export class JournalSuggestionService {
  // Create journal suggestion
  async createSuggestion(
    data: {
      title: string;
      subjectDomain: string;
      description: string;
      reason: string;
      supportingInfo?: string;
      attachmentUrl?: string;
    },
    userId: string
  ) {
    // 1. Resolve author profile
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
        throw new BadRequestError("Author profile not found for this user");
      }
    }

    // 2. Create suggestion
    const suggestion = await prisma.journalSuggestion.create({
      data: {
        authorId: author.id,
        title: data.title,
        subjectDomain: data.subjectDomain,
        description: data.description,
        reason: data.reason,
        supportingInfo: data.supportingInfo || null,
        attachmentUrl: data.attachmentUrl || null,
        status: "SUBMITTED"
      },
      include: {
        author: true
      }
    });

    // 3. Log history
    await prisma.journalSuggestionHistory.create({
      data: {
        suggestionId: suggestion.id,
        status: "SUBMITTED",
        actionBy: userId,
        remarks: "Journal suggestion submitted by author"
      }
    });

    // 4. Create notification for editors and admin
    const recipients = await prisma.users.findMany({
      where: { role: { in: ["ADMIN", "EDITOR"] } }
    });

    for (const recipient of recipients) {
      await createNotification(
        recipient.id,
        "New Journal Suggestion",
        `Author ${author.fullName} has suggested a new journal: "${data.title}".`
      );
    }

    // 5. Log activity
    await logActivity(
      userId,
      "CREATE",
      "journal-suggestion",
      `Author suggested new journal "${data.title}".`
    );

    return suggestion;
  }

  // List suggestions
  async getSuggestions(userId: string, role: string) {
    if (role === "ADMIN" || role === "EDITOR" || role === "SUB_ADMIN") {
      return prisma.journalSuggestion.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
          history: {
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { id: true, name: true, email: true, role: true } }
            }
          }
        }
      });
    }

    // Author sees their own suggestions
    const author = await prisma.author.findFirst({
      where: { userId }
    });

    if (!author) {
      return [];
    }

    return prisma.journalSuggestion.findMany({
      where: { authorId: author.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        history: {
          orderBy: { createdAt: "desc" },
          include: { user: true }
        }
      }
    });
  }

  // Get detail
  async getSuggestionById(id: string, userId: string, role: string) {
    const suggestion = await prisma.journalSuggestion.findUnique({
      where: { id },
      include: {
        author: true,
        history: {
          orderBy: { createdAt: "asc" },
          include: { user: true }
        }
      }
    });

    if (!suggestion) {
      throw new NotFoundError("Journal suggestion not found");
    }

    // IDOR Check for Authors
    if (role === "AUTHOR") {
      const author = await prisma.author.findFirst({ where: { userId } });
      if (!author || suggestion.authorId !== author.id) {
        throw new BadRequestError("Unauthorized: You do not own this suggestion");
      }
    }

    return suggestion;
  }

  // Editor evaluation
  async evaluateSuggestion(
    id: string,
    newStatus: JournalSuggestionStatus,
    remarks: string,
    userId: string
  ) {
    const suggestion = await prisma.journalSuggestion.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!suggestion) {
      throw new NotFoundError("Suggestion not found");
    }

    const allowedEditorStatuses: JournalSuggestionStatus[] = [
      "UNDER_EDITOR_REVIEW",
      "EDITOR_RECOMMENDED",
      "CHANGES_REQUESTED",
      "REJECTED"
    ];

    if (!allowedEditorStatuses.includes(newStatus)) {
      throw new BadRequestError(`Invalid evaluation status: ${newStatus}`);
    }

    // Update status
    const updated = await prisma.journalSuggestion.update({
      where: { id },
      data: { status: newStatus },
      include: { author: true }
    });

    // Save history
    await prisma.journalSuggestionHistory.create({
      data: {
        suggestionId: id,
        status: newStatus,
        actionBy: userId,
        remarks: remarks || `Editor evaluated: status changed to ${newStatus}`
      }
    });

    // Notify Author
    if (suggestion.author.userId) {
      await createNotification(
        suggestion.author.userId,
        "Journal Suggestion Updated",
        `Your journal suggestion "${suggestion.title}" status was updated to ${newStatus} by Editor. Remarks: ${remarks || "none"}`
      );
    }

    // If recommended, notify Admin
    if (newStatus === "EDITOR_RECOMMENDED") {
      const admins = await prisma.users.findMany({ where: { role: "ADMIN" } });
      for (const admin of admins) {
        await createNotification(
          admin.id,
          "New Recommendation: Journal Suggestion",
          `Editor has recommended journal suggestion "${suggestion.title}" for Admin review.`
        );
      }
    }

    // Log activity
    await logActivity(
      userId,
      "UPDATE",
      "journal-suggestion",
      `Editor evaluated journal suggestion "${suggestion.title}" to status ${newStatus}.`
    );

    return updated;
  }

  // Admin decision
  async makeDecision(
    id: string,
    newStatus: JournalSuggestionStatus,
    remarks: string,
    userId: string
  ) {
    const suggestion = await prisma.journalSuggestion.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!suggestion) {
      throw new NotFoundError("Suggestion not found");
    }

    const allowedAdminStatuses: JournalSuggestionStatus[] = [
      "APPROVED",
      "REJECTED",
      "CHANGES_REQUESTED",
      "UNDER_EDITOR_REVIEW",
      "CLOSED"
    ];

    if (!allowedAdminStatuses.includes(newStatus)) {
      throw new BadRequestError(`Invalid admin decision status: ${newStatus}`);
    }

    // Update status
    const updated = await prisma.journalSuggestion.update({
      where: { id },
      data: { status: newStatus },
      include: { author: true }
    });

    // Save history
    await prisma.journalSuggestionHistory.create({
      data: {
        suggestionId: id,
        status: newStatus,
        actionBy: userId,
        remarks: remarks || `Admin decision: status changed to ${newStatus}`
      }
    });

    // Notify Author
    if (suggestion.author.userId) {
      await createNotification(
        suggestion.author.userId,
        "Journal Suggestion Decision",
        `Admin has made a decision on your suggestion "${suggestion.title}": ${newStatus}. Remarks: ${remarks || "none"}`
      );
    }

    // Log activity
    await logActivity(
      userId,
      "UPDATE",
      "journal-suggestion",
      `Admin made decision on journal suggestion "${suggestion.title}" to status ${newStatus}.`
    );

    return updated;
  }
}
