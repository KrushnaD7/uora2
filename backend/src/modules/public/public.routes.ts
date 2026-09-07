import { Router } from "express";

import {
  getPublicJournals,
  getPublicJournalBySlug,
  getPublicIssues,
  getPublicVolumeById,
  getPublicIssueById,
  getPublicArticles,
  getPublicArticleById,
  downloadArticlePDF,
} from "./public.controller";


const router = Router();


// ==================================
// Public Journals
// ==================================


// Get all active journals
router.get(
  "/journals",
  getPublicJournals
);


// Get journal details by slug
router.get(
  "/journals/:slug",
  getPublicJournalBySlug
);



// ==================================
// Public Volumes & Issues
// ==================================


// Get all published issues
// IMPORTANT: Keep this before /issues/:id
router.get(
  "/issues",
  getPublicIssues
);


// Get volume details (with published issues & articles)
router.get(
  "/volumes/:id",
  getPublicVolumeById
);


// Get issue details (with articles)
router.get(
  "/issues/:id",
  getPublicIssueById
);



// ==================================
// Public Articles
// ==================================


// Get all published articles
router.get(
  "/articles",
  getPublicArticles
);


// Download article PDF
// IMPORTANT: Keep this before /articles/:id
router.get(
  "/articles/:id/download",
  downloadArticlePDF
);


// Get article details
router.get(
  "/articles/:id",
  getPublicArticleById
);



export default router;