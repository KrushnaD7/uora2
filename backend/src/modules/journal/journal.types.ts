export interface CreateJournalDto {
  name: string;
  shortName: string;
  slug: string;
  subdomain: string;
  issn?: string;
  eissn?: string;
  email?: string;
  phone?: string;
}

export interface UpdateJournalDto {
  name?: string;
  shortName?: string;
  issn?: string;
  eissn?: string;
  email?: string;
  phone?: string;
}