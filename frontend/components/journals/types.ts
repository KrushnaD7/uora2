export interface Journal {
  id: number;
  title: string;
  shortName: string;
  description: string;

  issn: string;
  frequency: string;
  category: string;

  publisher: string;
  language: string;
  startYear: number;

  openAccess: boolean;
  peerReviewed: boolean;
  featured: boolean;

  volumesCount: number;

  website: string;
}