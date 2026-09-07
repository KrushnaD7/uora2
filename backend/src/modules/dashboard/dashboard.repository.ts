import { prisma } from "../../config/prisma";

export class DashboardRepository {
  // Statistics
  async getStatistics() {
    const [
      journals,
      authors,
      reviewers,
      submissions,
      articles,
      accepted,
      rejected,
      underReview,
      revisionRequired,
      published,
    ] = await Promise.all([
      prisma.journal.count({
        where: { deletedAt: null },
      }),

      prisma.author.count({
        where: { deletedAt: null },
      }),

      prisma.reviewer.count({
        where: { deletedAt: null },
      }),

      prisma.submission.count({
        where: { deletedAt: null },
      }),

      prisma.article.count(),

      prisma.submission.count({
        where: {
          status: "ACCEPTED",
        },
      }),

      prisma.submission.count({
        where: {
          status: "REJECTED",
        },
      }),

      prisma.submission.count({
        where: {
          status: "UNDER_REVIEW",
        },
      }),

      prisma.submission.count({
        where: {
          status: "REVISION_REQUIRED",
        },
      }),

      prisma.submission.count({
        where: {
          status: "PUBLISHED",
        },
      }),
    ]);

    return {
      journals,
      authors,
      reviewers,
      submissions,
      articles,
      accepted,
      rejected,
      underReview,
      revisionRequired,
      published,
    };
  }

  // Recent Submissions
  getRecentSubmissions() {
    return prisma.submission.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        journal: true,
      },
    });
  }

  // Recent Rejected Submissions
  getRecentRejectedSubmissions() {
    return prisma.submission.findMany({
      where: {
        status: "REJECTED",
      },
      take: 5,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        journal: true,
      },
    });
  }

  // Recent Articles
  getRecentArticles() {
    return prisma.article.findMany({
      take: 5,
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        journal: true,
        issue: true,
      },
    });
  }

  // Monthly Submission Statistics
  getMonthlySubmissions() {
    return prisma.submission.groupBy({
      by: ["createdAt"],
      _count: true,
      orderBy: {
        createdAt: "asc",
      },
    });
  }
}