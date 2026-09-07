import { prisma } from "../../config/prisma";
import path from "path";

import { ArticleRepository } from "./article.repository";
import { SubmissionRepository } from "../submission/submission.repository";
import { IssueRepository } from "../issue/issue.repository";
import { buildQuery } from "../../shared/query/query-builder";
import { getPaginationMeta } from "../../shared/query/pagination";
import {
  PublishArticleInput,
  UpdateArticleInput,
} from "./article.validation";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";

export class ArticleService {
  constructor(
    private repository = new ArticleRepository(),
    private submissionRepository = new SubmissionRepository(),
    private issueRepository = new IssueRepository()
  ) {}

  // Publish Article
  async publishArticle(data: PublishArticleInput) {
    // 1. Check submission exists
    const submission =
      await this.submissionRepository.findById(
        data.submissionId
      );

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    // 2. Submission must be ACCEPTED
    if (submission.status !== "ACCEPTED") {
      throw new ConflictError(
        "Only accepted submissions can be published"
      );
    }

    // 3. Check issue exists
    const issue =
      await this.issueRepository.findById(
        data.issueId
      );

    if (!issue) {
      throw new NotFoundError("Issue not found");
    }

    if (issue.journalId !== data.journalId) {
      throw new ConflictError("Issue does not belong to the specified journal");
    }

    if (submission.journalId !== data.journalId) {
      throw new ConflictError("Submission does not belong to the specified journal");
    }

    // 4. Prevent duplicate publication
    const alreadyPublished =
      await this.repository.findBySubmission(
        data.submissionId
      );

    if (alreadyPublished) {
      throw new ConflictError(
        "Article already published"
      );
    }

    // 5. Generate DOI (or use the one provided by the admin)
    const doi =
      data.doi ||
      `10.5678/uora.${new Date().getFullYear()}.${Date.now()}`;

    // 5b. Auto-link the submission's final accepted file when no pdfUrl is
    // provided. Most accepted submissions have gone through at least one
    // revision round, so the file actually meant for publication is usually
    // the LATEST entry in submission.revisions -- not the original
    // MANUSCRIPT upload. Checking only MANUSCRIPT (as before) silently left
    // pdfUrl empty for any submission that had been revised, even though a
    // real file existed. Preference order: latest revision > REVISION-typed
    // submission file > original MANUSCRIPT file.
    const latestRevision =
      submission.revisions && submission.revisions.length > 0
        ? [...submission.revisions].sort(
            (a: any, b: any) => b.revisionNumber - a.revisionNumber
          )[0]
        : undefined;

    const revisionTypeFile =
      submission.files?.find((f: any) => f.fileType === "REVISION");

    const manuscriptFile =
      submission.files?.find((f: any) => f.fileType === "MANUSCRIPT");

    const finalFilePath =
      latestRevision?.filePath ||
      revisionTypeFile?.filePath ||
      manuscriptFile?.filePath;

    const pdfUrl =
      data.pdfUrl ||
      (finalFilePath
        ? `/uploads/${path.basename(finalFilePath)}`
        : undefined);

    // 6. Create article (title falls back to the submission title)
    const scheduledPublishAt = data.scheduledPublishAt
      ? new Date(data.scheduledPublishAt)
      : null;

    const isScheduled = scheduledPublishAt && scheduledPublishAt > new Date();

    const article =
      await prisma.$transaction(async (tx) => {
        const created =
          await tx.article.create({
            data: {
              ...data,
              scheduledPublishAt: scheduledPublishAt as any,
              publishedAt: isScheduled ? null : new Date(),
              doi,
              title: data.title || submission.title,
              pdfUrl,
            },
          });

        // 7. If scheduled for the future, keep submission at ACCEPTED
        if (isScheduled) {
          await tx.submissionStatusHistory.create({
            data: {
              submissionId: data.submissionId,
              status: "ACCEPTED",
              remarks: `Article scheduled for publication on ${scheduledPublishAt!.toLocaleDateString()}`,
            },
          });
          return created;
        }

        // 7b. Otherwise publish immediately
        await tx.submission.update({
          where: {
            id: data.submissionId,
          },
          data: {
            status: "PUBLISHED",
          },
        });

        // 7c. Auto-publish the issue it belongs to
        await tx.issue.update({
          where: {
            id: data.issueId,
          },
          data: {
            status: "PUBLISHED",
            publishedAt: new Date(),
          },
        });

        // 8. Save status history
        await tx.submissionStatusHistory.create({
          data: {
            submissionId: data.submissionId,
            status: "PUBLISHED",
            remarks: "Article published successfully",
          },
        });

        return created;
      });

    return article;
  }

  // Get All Articles
async getAllArticles(query: any) {

  const prismaQuery = buildQuery({

    page: query.page,

    limit: query.limit,

    search: query.search,

    searchFields: [
      "title",
      "doi",
      "pages"
    ],

    filters: {

      journalId: query.journalId,

      issueId: query.issueId

    },

    sortBy: query.sortBy,

    sortOrder: query.sortOrder

  });


  const result =
    await this.repository.findAll(
      prismaQuery
    );


  return {

    meta: getPaginationMeta(

      result.total,

      prismaQuery.page,

      prismaQuery.limit

    ),

    data: result.data

  };

}

  // Get Article
  async getArticleById(id: string) {
    const article =
      await this.repository.findById(id);

    if (!article) {
      throw new NotFoundError(
        "Article not found"
      );
    }

    return article;
  }

  // Update Article
  async updateArticle(
    id: string,
    data: UpdateArticleInput
  ) {
    const article =
      await this.repository.findById(id);

    if (!article) {
      throw new NotFoundError(
        "Article not found"
      );
    }

    return this.repository.update(id, data);
  }

  // Delete Article
  async deleteArticle(id: string) {
    const article =
      await this.repository.findById(id);

    if (!article) {
      throw new NotFoundError(
        "Article not found"
      );
    }

    await this.repository.delete(id);
  }

  // Publish Scheduled Articles (called by cron)
  async publishScheduledArticles() {
    const articles =
      await this.repository.findScheduledToPublish();

    for (const article of articles) {
      try {
        // All four writes must succeed together so the submission, article and
        // issue never fall out of sync with each other.
        await prisma.$transaction(async (tx) => {
          await tx.submission.update({
            where: { id: article.submissionId },
            data: { status: "PUBLISHED" },
          });

          await tx.article.update({
            where: { id: article.id },
            data: {
              scheduledPublishAt: null,
              publishedAt: new Date(),
            },
          });

          await tx.issue.update({
            where: { id: article.issueId },
            data: {
              status: "PUBLISHED",
              publishedAt: new Date(),
            },
          });

          await tx.submissionStatusHistory.create({
            data: {
              submissionId: article.submissionId,
              status: "PUBLISHED",
              remarks: `Article auto-published on scheduled date`,
            },
          });
        });
      } catch (err) {
        console.error(`Failed to auto-publish article ${article.id}:`, err);
      }
    }

    return articles.length;
  }
}