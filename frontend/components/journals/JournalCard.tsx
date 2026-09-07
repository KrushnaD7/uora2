import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Journal } from "./types";

/**
 * The lead journal in the featured grid: full metadata, both actions visible.
 * Compact siblings use `JournalRow` so the section never reads as four
 * identical cards.
 */
export default function JournalCard({
  journal,
  className,
}: {
  journal: Journal;
  className?: string;
}) {
  // The portfolio launches with ISSNs pending, so show that rather than "XXXX-XXXX"
  const issn = /^x+-x+$/i.test(journal.issn) ? "Applied for" : journal.issn;

  const meta = [
    { key: "ISSN", value: issn },
    { key: "Frequency", value: journal.frequency },
    { key: "Discipline", value: journal.category },
    { key: "Since", value: String(journal.startYear) },
  ];

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-md",
        "transition-[transform,box-shadow,border-color] duration-400 ease-out hover:-translate-y-1 hover:border-brand-300/70 hover:shadow-xl",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-brand-50/80 to-transparent"
      />

      <div className="relative flex flex-1 flex-col p-7 sm:p-9">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-lg bg-navy-950 px-2.5 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-white">
            {journal.shortName}
          </span>
          <Badge tone="brand" size="sm">
            Flagship
          </Badge>
          {journal.openAccess && (
            <Badge tone="neutral" size="sm">
              Open access
            </Badge>
          )}
          {journal.peerReviewed && (
            <Badge tone="neutral" size="sm">
              Peer reviewed
            </Badge>
          )}
        </div>

        <h3 className="font-display mt-6 text-[1.65rem] font-semibold leading-[1.16] tracking-[-0.02em] text-navy-950 sm:text-[1.9rem]">
          {journal.title}
        </h3>

        <p className="mt-4 max-w-xl text-[15px] leading-7 text-ink-600">
          {journal.description}
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          {meta.map((item) => (
            <div key={item.key} className="bg-ink-50/70 px-4 py-3.5">
              <dt className="label-caps text-ink-400">{item.key}</dt>
              <dd className="mt-1.5 text-[13px] font-semibold leading-snug text-navy-900">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap gap-3 pt-1">
          <Button href={journal.website} size="md">
            Submit to this journal
            <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </Button>
          <Button href={journal.website} variant="secondary" size="md">
            Journal homepage
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Compact list row used for the supporting featured journals. */
export function JournalRow({ journal }: { journal: Journal }) {
  return (
    <li>
      <Link
        href={journal.website}
        className="group flex items-start gap-4 bg-white p-5 transition-colors duration-300 hover:bg-brand-50/50 sm:p-6"
      >
        <span className="mt-0.5 flex shrink-0 items-center justify-center rounded-lg border border-line bg-ink-50 px-2 py-1.5 font-mono text-[10.5px] font-semibold tracking-wide text-navy-800 transition-colors duration-300 group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-700">
          {journal.shortName}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-snug text-navy-950">
            {journal.title}
          </span>
          <span className="mt-1.5 block text-[13px] text-ink-500">
            {journal.category} · {journal.frequency}
          </span>
        </span>

        <ArrowUpRight className="mt-1 size-4 shrink-0 text-ink-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" />
      </Link>
    </li>
  );
}
