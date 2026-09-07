import { prisma } from "../../config/prisma";

import {
  PublishArticleInput,
  UpdateArticleInput,
} from "./article.validation";

export class ArticleRepository {

  create(
    data: PublishArticleInput & {
      doi: string;
      title: string;
      scheduledPublishAt?: Date | null;
      publishedAt?: Date | null;
    }
  ) {

    return prisma.article.create({

      data,

    });

  }



  // ===============================
  // Get All Articles
  // ===============================

  async findAll(query: any) {

    const [data, total] =
      await Promise.all([

        prisma.article.findMany({

          where: query.where,

          orderBy: query.orderBy,

          skip: query.skip,

          take: query.take,

          include: {

            journal: true,

            issue: true,

            submission: {

              select: {

                id: true,

                title: true,

                abstract: true,

                paperId: true,

              },

            },

          },

        }),

        prisma.article.count({

          where: query.where,

        }),

      ]);


    return {

      data,

      total,

    };

  }



  // ===============================
  // Get Article By ID
  // ===============================

  findById(id: string) {

    return prisma.article.findUnique({

      where: {

        id,

      },

      include: {

        journal: true,

        issue: true,

        submission: {

          select: {

            id: true,

            title: true,

            abstract: true,

            paperId: true,

          },

        },

      },

    });

  }



  // ===============================
  // Find By Submission
  // ===============================

  findBySubmission(
    submissionId: string
  ) {

    return prisma.article.findUnique({

      where: {

        submissionId,

      },

    });

  }



  // ===============================
  // Update Article
  // ===============================

  update(
    id: string,
    data: UpdateArticleInput
  ) {

    return prisma.article.update({

      where: {

        id,

      },

      data,

    });

  }



  // ===============================
  // Delete Article
  // ===============================

  delete(id: string) {

    return prisma.article.delete({

      where: {

        id,

      },

    });

  }



  // ===============================
  // Find Scheduled Articles To Publish
  // ===============================

  findScheduledToPublish() {
    return prisma.article.findMany({
      where: {
        scheduledPublishAt: {
          not: null,
          lte: new Date(),
        },
      },
      include: {
        submission: true,
      },
    });
  }

}