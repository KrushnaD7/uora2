import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

/**
 * Wires the UORA-AI journal with its people (reusing the existing users):
 *  - author "author 1" (a1@gmail.com) submits a sample manuscript
 *  - reviewer "reviewer" (r1@gmail.com) is assigned to it
 *  - a PENDING reviewer application with an attached CV is created so the
 *    admin can test the inline CV preview + approve/reject flow.
 *
 * Idempotent: re-running never duplicates.
 */

const prisma = new PrismaClient();

async function main() {
  const uorai = await prisma.journal.findUnique({ where: { slug: "uora-ai" } });
  if (!uorai) throw new Error('Journal with slug "uora-ai" not found.');

  const author = await prisma.author.findFirst({ where: { email: "a1@gmail.com" } });
  const reviewer = await prisma.reviewer.findFirst({ where: { email: "r1@gmail.com" } });
  const admin = await prisma.users.findUnique({ where: { email: "admin@uora.com" } });

  if (!author) throw new Error('Author "a1@gmail.com" not found.');
  if (!reviewer) throw new Error('Reviewer "r1@gmail.com" not found.');
  if (!admin) throw new Error('Admin "admin@uora.com" not found.');

  const uploadsDir = path.join(process.cwd(), "uploads");
  const msName = "uorai-2026-001-manuscript.pdf";
  const msPath = path.join(uploadsDir, msName);
  const srcPdf = path.join(uploadsDir, "articles", "ujgsm-v1i1-a1.pdf");

  if (!fs.existsSync(msPath) && fs.existsSync(srcPdf)) {
    fs.copyFileSync(srcPdf, msPath);
    console.log("Copied manuscript PDF ->", msPath);
  }

  // 1. Sample submission by author a1 for UORA-AI
  const existingSub = await prisma.submission.findUnique({
    where: { paperId: "UORAI-2026-001" },
  });

  if (existingSub) {
    console.log("Submission UORAI-2026-001 already exists — skipping.");
  } else {
    const sub = await prisma.submission.create({
      data: {
        journalId: uorai.id,
        paperId: "UORAI-2026-001",
        title:
          "Evaluating Lightweight Transformer Models for Low-Resource Text Classification",
        abstract:
          "This paper evaluates lightweight transformer architectures (DistilBERT, TinyBERT and MobileBERT) " +
          "on low-resource text classification benchmarks. Results show that model compression offers " +
          "competitive accuracy at a fraction of the inference cost, making such models practical for " +
          "resource-constrained deployment in academic and industrial settings.",
        status: "UNDER_REVIEW",
        correspondingEmail: "a1@gmail.com",
        authors: {
          create: {
            authorId: author.id,
            authorOrder: 1,
            isCorresponding: true,
          },
        },
        files: {
          create: {
            fileType: "MANUSCRIPT",
            originalName: msName,
            storedName: msName,
            filePath: path.join("uploads", msName),
            mimeType: "application/pdf",
            fileSize: fs.existsSync(msPath) ? fs.statSync(msPath).size : null,
          },
        },
      },
    });

    await prisma.submissionReviewer.create({
      data: {
        submissionId: sub.id,
        reviewerId: reviewer.id,
        assignedBy: admin.id,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        remarks: "Invited by the editor for peer review",
      },
    });

    await prisma.submissionStatusHistory.create({
      data: {
        submissionId: sub.id,
        status: "UNDER_REVIEW",
        remarks: "Assigned to reviewer for peer review",
      },
    });

    console.log("Created UORA-AI submission + reviewer assignment:", sub.id);
  }

  // 1b. Accepted submission ready to be published (for the Publish Article flow)
  const existingAcc = await prisma.submission.findUnique({
    where: { paperId: "UORAI-2026-002" },
  });

  if (existingAcc) {
    console.log("Submission UORAI-2026-002 already exists — skipping.");
  } else {
    const accMsName = "uorai-2026-002-manuscript.pdf";
    const accMsPath = path.join(uploadsDir, accMsName);
    const srcAccPdf = path.join(uploadsDir, "articles", "ujgsm-v1i2-a1.pdf");

    if (!fs.existsSync(accMsPath) && fs.existsSync(srcAccPdf)) {
      fs.copyFileSync(srcAccPdf, accMsPath);
      console.log("Copied accepted-manuscript PDF ->", accMsPath);
    }

    const accSub = await prisma.submission.create({
      data: {
        journalId: uorai.id,
        paperId: "UORAI-2026-002",
        title:
          "Adaptive Learning Rate Scheduling for CNN Training on Embedded Vision Systems",
        abstract:
          "This paper proposes an adaptive learning-rate scheduling strategy that stabilises CNN training on " +
          "embedded vision platforms with limited memory and compute. Empirical results on edge benchmarks show " +
          "faster convergence and improved final accuracy compared to cosine and step decay baselines.",
        status: "ACCEPTED",
        correspondingEmail: "a1@gmail.com",
        authors: {
          create: {
            authorId: author.id,
            authorOrder: 1,
            isCorresponding: true,
          },
        },
        files: {
          create: {
            fileType: "MANUSCRIPT",
            originalName: accMsName,
            storedName: accMsName,
            filePath: path.join("uploads", accMsName),
            mimeType: "application/pdf",
            fileSize: fs.existsSync(accMsPath) ? fs.statSync(accMsPath).size : null,
          },
        },
      },
    });

    await prisma.submissionStatusHistory.create({
      data: {
        submissionId: accSub.id,
        status: "ACCEPTED",
        remarks: "Accepted for publication",
      },
    });

    console.log("Created accepted submission UORAI-2026-002:", accSub.id);
  }

  // 1c. Volume + issue for UORA-AI so articles can be published and previewed
  let volume = await prisma.volume.findFirst({
    where: { journalId: uorai.id, volumeNumber: 1 },
  });
  if (!volume) {
    volume = await prisma.volume.create({
      data: { journalId: uorai.id, volumeNumber: 1, year: 2026 },
    });
    console.log("Created UORA-AI Volume 1:", volume.id);
  }

  let issue = await prisma.issue.findFirst({
    where: { volumeId: volume.id, issueNumber: 1 },
  });
  if (!issue) {
    issue = await prisma.issue.create({
      data: { journalId: uorai.id, volumeId: volume.id, issueNumber: 1, status: "UPCOMING" },
    });
    console.log("Created UORA-AI Issue 1:", issue.id);
  }

  // 2. PENDING reviewer application with CV (for the admin preview/decision flow)
  const appEmail = "sneha.patil@gmail.com";
  const existingApp = await prisma.reviewerApplication.findFirst({
    where: { email: appEmail },
  });

  if (existingApp) {
    console.log("Pending application already exists — skipping.");
  } else {
    const cvName = "cv-sneha-patil.pdf";
    const cvPath = path.join(uploadsDir, cvName);
    const srcCv = path.join(uploadsDir, "1786641379994-761613524.pdf");

    if (!fs.existsSync(cvPath) && fs.existsSync(srcCv)) {
      fs.copyFileSync(srcCv, cvPath);
      console.log("Copied CV PDF ->", cvPath);
    }

    await prisma.reviewerApplication.create({
      data: {
        journalId: uorai.id,
        fullName: "Dr. Sneha Patil",
        email: appEmail,
        mobile: "+91 98220 12345",
        institution: "Pune Institute of Technology",
        designation: "Associate Professor",
        expertise: "Machine Learning, Natural Language Processing, Data Mining",
        cvFile: cvName,
        status: "PENDING",
      },
    });

    console.log("Created pending reviewer application for", appEmail);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
