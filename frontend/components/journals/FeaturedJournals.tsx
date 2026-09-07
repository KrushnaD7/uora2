import Link from "next/link";
import { ArrowRight, Library } from "lucide-react";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import JournalCard, { JournalRow } from "./JournalCard";
import type { Journal } from "./types";
import { toJournal } from "./toJournal";
import { serverGetPublicJournals } from "@/lib/server/data";
import type { JournalModel } from "@/lib/api/journals";

export default async function FeaturedJournals() {
  const res = await serverGetPublicJournals<JournalModel[]>();
  const data = res.data ?? [];

  if (!res.success || data.length === 0) {
    return null;
  }

  const sorted = [...data].sort(
    (a, b) =>
      (b.volumes?.length ?? 0) - (a.volumes?.length ?? 0) ||
      a.name.localeCompare(b.name)
  );
  const journals = sorted.map(toJournal);
  const disciplines = new Set(journals.map((j) => j.category)).size;
  const volumesLive = journals.reduce((sum, j) => sum + (j.volumesCount ?? 0), 0);

  const [lead, ...supporting] = journals;

  return (
    <Section
      id="journals"
      tone="white"
      size="lg"
      divider="bottom"
      aria-labelledby="journals-title"
    >
      <Container width="wide">
        <SectionHeader
          id="journals-title"
          size="lg"
          eyebrow="The portfolio"
          title={
            <>
              Journals that hold their
              <span className="text-brand-700"> standard</span>
            </>
          }
          description={`${journals.length} international, peer-reviewed, open-access ${
            journals.length === 1 ? "journal" : "journals"
          } currently accepting submissions${
            disciplines > 1 ? ` across ${disciplines} disciplines` : ""
          }.`}
          action={
            <Button href="/journals" variant="secondary" size="lg">
              View all {journals.length}{" "}
              {journals.length === 1 ? "journal" : "journals"}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </Button>
          }
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-7">
          <Reveal className="lg:col-span-7" amount={0.15}>
            {lead && <JournalCard journal={lead} className="h-full" />}
          </Reveal>

          <Reveal
            className="lg:col-span-5"
            direction="left"
            delay={0.1}
            amount={0.15}
          >
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              <div className="border-b border-line bg-ink-50/70 px-6 py-4">
                <p className="label-caps text-ink-500">
                  Also accepting submissions
                </p>
              </div>

              <ul className="flex-1 divide-y divide-line">
                {supporting.map((journal) => (
                  <JournalRow key={journal.id} journal={journal} />
                ))}
              </ul>

              <div className="border-t border-line bg-ink-50/70 px-6 py-5">
                <p className="flex items-start gap-2.5 text-[13px] leading-6 text-ink-600">
                  <Library className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  Every title is quarterly, open access under CC BY 4.0, and
                  assigns a permanent DOI on acceptance.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Full portfolio at a glance */}
        <Reveal delay={0.14} amount={0.1}>
          <div className="mt-8 rounded-2xl border border-line bg-ink-50/60 p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <p className="label-caps text-ink-500">Complete portfolio</p>
              <p className="text-[13px] text-ink-500">
                {volumesLive > 0
                  ? `${volumesLive} published ${
                      volumesLive === 1 ? "volume" : "volumes"
                    } now live`
                  : "Accepting submissions now"}
              </p>
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {journals.map((journal) => (
                <li key={journal.id}>
                  <Link
                    href={journal.website}
                    title={journal.title}
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 font-mono text-[11.5px] font-semibold tracking-wide text-navy-800 shadow-xs transition-[color,border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {journal.shortName}
                    <span className="hidden text-[11px] font-medium text-ink-500 sm:inline">
                      {journal.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
