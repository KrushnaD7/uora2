import { api } from "./client";

export interface JournalModel {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  subdomain: string;
  issn?: string | null;
  eissn?: string | null;
  email?: string | null;
  phone?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  settings?: {
    logo?: string | null;
    favicon?: string | null;
    about?: string | null;
    aimsScope?: string | null;
    ethics?: string | null;
    guidelines?: string | null;
  } | null;
  volumes?: VolumeModel[];
}

export type JournalRef = Pick<
  JournalModel,
  "id" | "name" | "shortName" | "slug" | "issn" | "eissn"
> & {
  settings?: JournalModel["settings"];
};

export interface ArticleModel {
  id: string;
  journalId: string;
  issueId: string;
  submissionId: string;
  title: string;
  doi?: string | null;
  pages?: string | null;
  pdfUrl?: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  journal?: JournalRef;
  issue?: IssueModel;
  submission?: {
    id: string;
    title: string;
    abstract: string;
    paperId: string;
    authors?: {
      id: string;
      authorOrder: number;
      isCorresponding: boolean;
      author: {
        id: string;
        fullName: string;
        email?: string | null;
        institution?: string | null;
        designation?: string | null;
      };
    }[];
    files?: {
      id: string;
      fileType: string;
      originalName: string;
      filePath: string;
    }[];
  };
}

export interface IssueModel {
  id: string;
  journalId: string;
  volumeId: string;
  issueNumber: number;
  title?: string | null;
  status: "UPCOMING" | "PUBLISHED";
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  journal?: JournalRef;
  volume?: VolumeModel;
  articles?: ArticleModel[];
  _count?: {
    articles: number;
  };
}

export interface VolumeModel {
  id: string;
  journalId: string;
  volumeNumber: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  journal?: JournalRef;
  issues?: IssueModel[];
}

export function getPublicJournals() {
  return api.get<JournalModel[]>("/public/journals");
}

export function getPublicJournalBySlug(slug: string) {
  return api.get<JournalModel>(`/public/journals/${slug}`);
}

export function getPublicIssues() {
  return api.get<IssueModel[]>("/public/issues");
}

export function getPublicVolumeById(id: string) {
  return api.get<VolumeModel>(`/public/volumes/${id}`);
}

export function getPublicIssueById(id: string) {
  return api.get<IssueModel>(`/public/issues/${id}`);
}

export function getPublicArticles() {
  return api.get<ArticleModel[]>("/public/articles");
}

export function getPublicArticleById(id: string) {
  return api.get<ArticleModel>(`/public/articles/${id}`);
}

export function getArticleDownloadUrl(id: string) {
  return `/api/public/articles/${id}/download`;
}
