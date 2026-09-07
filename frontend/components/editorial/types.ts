export interface Editor {
  id: number;
  name: string;
  designation: string;
  role: string;
  affiliation: string;
  emails: string[];
  phone: string;
  image?: string;
  /** One line on what this editor is accountable for. */
  remit?: string;
}
