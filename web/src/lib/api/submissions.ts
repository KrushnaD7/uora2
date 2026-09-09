import { api } from "./client";

export interface AuthorProfile {
  id: string;
  fullName: string;
  email?: string | null;
  mobile?: string | null;
  country?: string | null;
  institution?: string | null;
  designation?: string | null;
  orcid?: string | null;
}

export interface SubmissionAuthor {
  id: string;
  submissionId: string;
  authorId: string;
  authorOrder: number;
  isCorresponding: boolean;
  author: AuthorProfile;
}

export interface SubmissionFile {
  id: string;
  submissionId: string;
  fileType: "MANUSCRIPT" | "REVISION" | "SUPPLEMENTARY" | "ARTICLE_PDF" | "REVIEWER_CV";
  originalName: string;
  storedName: string;
  filePath: string;
  mimeType?: string | null;
  fileSize?: number | null;
  uploadedAt: string;
}

export interface SubmissionModel {
  id: string;
  journalId: string;
  paperId: string;
  title: string;
  abstract: string;
  status: "DRAFT" | "SUBMITTED" | "INITIAL_SCREENING" | "UNDER_REVIEW" | "REVISION_REQUIRED" | "REVISED_SUBMITTED" | "ACCEPTED" | "REJECTED" | "PUBLISHED";
  correspondingEmail: string;
  correspondingPhone?: string | null;
  reviewerRequested?: boolean;
  createdAt: string;
  updatedAt: string;
  journal: {
    id: string;
    name: string;
    shortName: string;
    slug: string;
  };
  authors: SubmissionAuthor[];
  files: SubmissionFile[];
}

export interface CreateSubmissionInput {
  journalId: string;
  title: string;
  abstract: string;
  correspondingEmail: string;
  correspondingPhone?: string;
  status?: "DRAFT" | "SUBMITTED";
}

// Fetch all submissions (for Editors/Admins)
export function getAllSubmissions() {
  return api.get<SubmissionModel[]>("/submissions");
}

// Fetch logged-in author's submissions
export function getMySubmissions() {
  return api.get<SubmissionModel[]>("/submissions/my");
}

// Fetch submission by ID
export function getSubmissionById(id: string) {
  return api.get<SubmissionModel>(`/submissions/${id}`);
}

// Create new submission/draft
export function createSubmission(data: CreateSubmissionInput) {
  return api.post<SubmissionModel>("/submissions", data);
}

// Transition status
export function transitionSubmissionStatus(id: string, status: string, remarks?: string) {
  return api.patch<SubmissionModel>(`/submissions/${id}/status`, { status, remarks });
}

// Upload file to submission
export function uploadManuscript(id: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return api.upload(`/submissions/${id}/upload`, formData);
}

// Request Reviewer Assignment
export function requestReviewer(id: string) {
  return api.post<SubmissionModel>(`/submissions/${id}/request-reviewer`);
}
