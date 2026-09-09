import ArchiveBrowser from "./ArchiveBrowser";
import { serverGetPublicJournals, serverGetPublicJournalBySlug } from "@/lib/server/data";
import type { IssueModel, JournalModel, VolumeModel } from "@/lib/api/journals";
import type { ArchiveEntry } from "./archiveData";
import { useAsyncData } from "@/lib/useAsyncData";

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

export default function ArchiveGrid({ journalSlug }: ArchiveGridProps = {}) {
  // Was an async server component; in the SPA the same sequence of requests
  // runs in the browser and its result is rendered once resolved.
  const { data, loading } = useAsyncData(async () => {
    let journals: Pick<JournalModel, "id" | "name" | "slug">[];

    if (journalSlug) {
      const single = await serverGetPublicJournalBySlug<JournalModel>(journalSlug);
      if (!single.success || !single.data) {
        return { error: single.message || "Journal not found" };
      }
      journals = [single.data];
    } else {
      const res = await serverGetPublicJournals<JournalModel[]>();
      if (!res.success || !res.data) {
        return { error: res.message || "Failed to load archives" };
      }
      journals = res.data;
    }

    const details = await Promise.all(
      journals.map((journal) =>
        serverGetPublicJournalBySlug<JournalModel>(journal.slug)
      )
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
    return { built };
  }, [journalSlug]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center">
        <p className="text-[15px] text-ink-500">Loading archives...</p>
      </div>
    );
  }

  if (!data || "error" in data) {
    return (
      <div className="rounded-2xl border border-line bg-white p-8 text-center">
        <p className="font-medium text-red-500">
          {data && "error" in data ? data.error : "Failed to load archives"}
        </p>
      </div>
    );
  }

  const built = data.built;

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
