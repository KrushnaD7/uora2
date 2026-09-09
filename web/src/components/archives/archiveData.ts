export type ArchiveYear = number | "All";

export interface ArchiveEntry {
  id: string;
  year: number;
  volume: string;
  issue: string;
  title: string;
  journal: string;
  journalSlug: string;
  volumeId: string;
  issueId: string;
  summary: string;
  articles: number;
}
