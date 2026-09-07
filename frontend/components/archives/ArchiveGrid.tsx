import ArchiveBrowser from "./ArchiveBrowser";
import { serverGetPublicJournals, serverGetPublicJournalBySlug } from "@/lib/server/data";
import type { IssueModel, JournalModel, VolumeModel } from "@/lib/api/journals";
import type { ArchiveEntry } from "./archiveData";

function toEntry(
  journal: Pick<JournalModel, "id" | "name" | "slug">,
  volume: VolumeModel,
  issue: IssueModel
): ArchiveEntry {
  const volumeLabel = `Vol. ${volume.volumeNumber}`;
  const issueLabel = `Issue ${issue.issueNumber}`;
  const count = issue.articles?.length ?? 0;

  return {
    id: `${journal.slug}-v${volume.volumeNumber}-i${issue.issueNumber}`,
    year: volume.year,
    volume: volumeLabel,
    issue: issueLabel,
    title: issue.title || `Volume ${volume.volumeNumber}, Issue ${issue.issueNumber}`,
    journal: journal.name,
    journalSlug: journal.slug,
    volumeId: volume.id,
    issueId: issue.id,
    summary: `${count} peer-reviewed ${count === 1 ? "article" : "articles"} published in ${journal.name}, ${volume.year}.`,
    articles: count,
  };
}

interface ArchiveGridProps {
  // When provided, only this journal's volumes/issues are shown -- used on
  // a journal's own subdomain, where "Archives" means ITS archive, not the
  // whole platform's.
  journalSlug?: string;
}

export default async function ArchiveGrid({ journalSlug }: ArchiveGridProps = {}) {
  let journals: Pick<JournalModel, "id" | "name" | "slug">[];

  if (journalSlug) {
    const single = await serverGetPublicJournalBySlug<JournalModel>(journalSlug);
    if (!single.success || !single.data) {
      return (
        <div className="rounded-2xl border border-line bg-white p-8 text-center">
          <p className="font-medium text-red-500">{single.message || "Journal not found"}</p>
        </div>
      );
    }
    journals = [single.data];
  } else {
    const res = await serverGetPublicJournals<JournalModel[]>();
    if (!res.success || !res.data) {
      return (
        <div className="rounded-2xl border border-line bg-white p-8 text-center">
          <p className="font-medium text-red-500">{res.message || "Failed to load archives"}</p>
        </div>
      );
    }
    journals = res.data;
  }

  const details = await Promise.all(
    journals.map((journal) => serverGetPublicJournalBySlug<JournalModel>(journal.slug))
  );

  const built: ArchiveEntry[] = [];
  for (const detail of details) {
    if (!detail.success || !detail.data) continue;
    for (const volume of detail.data.volumes ?? []) {
      for (const issue of volume.issues ?? []) {
        built.push(toEntry(detail.data, volume, issue));
      }
    }
  }

  if (built.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center">
        <p className="text-[15px] text-ink-500">
          No published volumes yet. Archives appear here as issues are published.
        </p>
      </div>
    );
  }

  return <ArchiveBrowser entries={built} />;
}
