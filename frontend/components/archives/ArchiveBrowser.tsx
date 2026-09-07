"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, FileText } from "lucide-react";

import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { ArchiveEntry, ArchiveYear } from "./archiveData";

function ArchiveCard({ entry }: { entry: ArchiveEntry }) {
  const href = entry.volumeId
    ? `/journals/${entry.journalSlug}/volumes/${entry.volumeId}/issues/${entry.issueId}`
    : `/journals/${entry.journalSlug}`;

  return (
    <li className="group relative rounded-2xl border border-line bg-white p-6 transition-colors duration-300 hover:border-brand-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge tone="brand">Published</Badge>
          <span className="font-mono text-[12px] uppercase tracking-widest text-ink-500">
            {entry.year}
          </span>
        </div>
        <span className="font-display text-sm font-semibold text-brand-700">
          {entry.volume} · {entry.issue}
        </span>
      </div>

      <h3 className="font-display mt-4 text-xl font-semibold text-navy-950">
        {entry.journal}
      </h3>
      <p className="mt-1 text-sm font-medium text-brand-700">{entry.title}</p>
      <p className="mt-3 text-[15px] leading-7 text-ink-600">{entry.summary}</p>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 text-brand-600" />
          {entry.year}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileText className="size-4 text-brand-600" />
          {entry.articles} {entry.articles === 1 ? "article" : "articles"}
        </span>
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-navy-950"
      >
        Open issue
        <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </li>
  );
}

export default function ArchiveBrowser({ entries }: { entries: ArchiveEntry[] }) {
  const [year, setYear] = useState<ArchiveYear>("All");

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const e of entries) set.add(e.year);
    return ["All", ...Array.from(set).sort((a, b) => b - a)] as ArchiveYear[];
  }, [entries]);

  const filtered =
    year === "All" ? entries : entries.filter((entry) => entry.year === year);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter archives by year"
        className="flex flex-wrap items-center gap-2"
      >
        {years.map((y) => {
          const selected = y === year;
          return (
            <button
              key={String(y)}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setYear(y)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-200",
                selected
                  ? "border-brand-700 bg-brand-700 text-white shadow-sm"
                  : "border-line bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"
              )}
            >
              {y}
            </button>
          );
        })}
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {filtered.map((entry) => (
          <ArchiveCard key={entry.id} entry={entry} />
        ))}
      </ul>
    </div>
  );
}
