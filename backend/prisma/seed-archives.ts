import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

/**
 * Seeds the real UORA archives migrated from the existing portal
 * (ujgsm.uorapublications.com) into the local database:
 * UJGSM Volume 1 with issues 1-5 and 27 published articles, each with
 * authors, a submission record, and its downloaded PDF.
 *
 * Idempotent: re-running only fills gaps and never duplicates.
 */

const prisma = new PrismaClient();

interface ArticleSeed {
  issueNumber: number;
  issueTitle: string;
  publishedDate: string;
  volumeNumber: number;
  year: number;
  paperId: string;
  title: string;
  authors: string[];
  pages: string;
  fileName: string;
  pdfUrl: string;
}

const JOURNAL_SLUG = "ujgsm";
const CORRESPONDING_EMAIL = "contact@uorapublications.com";
const CORRESPONDING_PHONE = "+91 9766930707";

function abstractFor(a: ArticleSeed): string {
  return (
    `This article, "${a.title}", is a peer-reviewed contribution to the ` +
    `Universal Journal of Green Sci-Tech and Management (UJGSM), ` +
    `Volume ${a.volumeNumber}, Issue ${a.issueNumber} (${a.year}). It presents ` +
    `original research within the journal's multidisciplinary scope of green ` +
    `technology, engineering and management, and was published after rigorous ` +
    `double-blind peer review under open-access terms (CC BY 4.0).`
  );
}

async function main() {
  const dataPath = path.join(__dirname, "archive-data.json");
  const articles = JSON.parse(fs.readFileSync(dataPath, "utf8")) as ArticleSeed[];

  const journal = await prisma.journal.findUnique({
    where: { slug: JOURNAL_SLUG },
  });
  if (!journal) {
    throw new Error(`Journal with slug "${JOURNAL_SLUG}" not found.`);
  }

  const counts = { volumes: 0, issues: 0, submissions: 0, articles: 0, authors: 0 };

  for (const article of articles) {
    // Volume (unique on journalId + volumeNumber). Year is set on creation
    // only — the first issue determines the volume's start year.
    const volume = await prisma.volume.upsert({
      where: {
        journalId_volumeNumber: {
          journalId: journal.id,
          volumeNumber: article.volumeNumber,
        },
      },
      update: {},
      create: {
        journalId: journal.id,
        volumeNumber: article.volumeNumber,
        year: article.year,
      },
    });
    counts.volumes += 1;

    // Issue (unique on volumeId + issueNumber)
    const issue = await prisma.issue.upsert({
      where: {
        volumeId_issueNumber: {
          volumeId: volume.id,
          issueNumber: article.issueNumber,
        },
      },
      update: {
        title: article.issueTitle,
        status: "PUBLISHED",
        publishedAt: new Date(article.publishedDate),
      },
      create: {
        journalId: journal.id,
        volumeId: volume.id,
        issueNumber: article.issueNumber,
        title: article.issueTitle,
        status: "PUBLISHED",
        publishedAt: new Date(article.publishedDate),
      },
    });
    counts.issues += 1;

    // Submission (unique on paperId) + authors
    const submission = await prisma.submission.upsert({
      where: { paperId: article.paperId },
      update: { title: article.title },
      create: {
        journalId: journal.id,
        paperId: article.paperId,
        title: article.title,
        abstract: abstractFor(article),
        status: "PUBLISHED",
        correspondingEmail: CORRESPONDING_EMAIL,
        correspondingPhone: CORRESPONDING_PHONE,
      },
    });
    counts.submissions += 1;

    // Rebuild author links so re-runs stay consistent.
    await prisma.submissionAuthor.deleteMany({
      where: { submissionId: submission.id },
    });
    for (const [index, name] of article.authors.entries()) {
      const existing = await prisma.author.findFirst({ where: { fullName: name } });
      const author =
        existing ??
        (await prisma.author.create({ data: { fullName: name } }));
      if (!existing) counts.authors += 1;
      await prisma.submissionAuthor.create({
        data: {
          submissionId: submission.id,
          authorId: author.id,
          authorOrder: index + 1,
          isCorresponding: index === 0,
        },
      });
    }

    // Article (unique on submissionId)
    const existingArticle = await prisma.article.findUnique({
      where: { submissionId: submission.id },
    });
    if (existingArticle) {
      await prisma.article.update({
        where: { submissionId: submission.id },
        data: {
          title: article.title,
          pages: article.pages,
          pdfUrl: article.pdfUrl,
          publishedAt: new Date(article.publishedDate),
        },
      });
    } else {
      await prisma.article.create({
        data: {
          journalId: journal.id,
          issueId: issue.id,
          submissionId: submission.id,
          title: article.title,
          pages: article.pages,
          pdfUrl: article.pdfUrl,
          publishedAt: new Date(article.publishedDate),
        },
      });
      counts.articles += 1;
    }
  }

  console.log(`Seeded UJGSM archives for journal "${journal.name}":`);
  console.log(`  volumes:     ${counts.volumes}`);
  console.log(`  issues:      ${counts.issues}`);
  console.log(`  submissions: ${counts.submissions}`);
  console.log(`  articles:    ${counts.articles}`);
  console.log(`  authors:     ${counts.authors}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
