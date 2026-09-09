import type { JournalModel } from "@/lib/api/journals";
import type { Journal } from "./types";

const DISCIPLINES: Record<string, string> = {
  ujgsm: "Green Science & Management",
  "uora-ai": "Artificial Intelligence",
};

export function toJournal(journal: JournalModel, index: number): Journal {
  const volumes = journal.volumes ?? [];
  const startYear =
    volumes.length > 0
      ? Math.min(...volumes.map((volume) => volume.year))
      : new Date(journal.createdAt).getFullYear();

  return {
    id: index + 1,
    shortName: journal.shortName,
    title: journal.name,
    description:
      journal.settings?.about ||
      journal.settings?.aimsScope ||
      "Universal peer-reviewed academic journal published by UORA Publications.",
    issn: journal.issn || "XXXX-XXXX",
    frequency: "Quarterly",
    category: DISCIPLINES[journal.slug] || "Multidisciplinary",
    publisher: "UORA Publications",
    language: "English",
    startYear,
    openAccess: true,
    peerReviewed: true,
    featured: true,
    volumesCount: volumes.length,
    website: `/journals/${journal.slug}`,
  };
}
