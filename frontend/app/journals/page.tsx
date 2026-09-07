import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import Badge from "@/components/ui/Badge";
import JournalCard from "@/components/journals/JournalCard";
import type { Journal } from "@/components/journals/types";
import type { JournalModel } from "@/lib/api/journals";
import { toJournal } from "@/components/journals/toJournal";
import { serverGetPublicJournals } from "@/lib/server/data";

export const revalidate = 3600;

export default async function JournalsPage() {
  const res = await serverGetPublicJournals<JournalModel[]>();
  const journals = (res.data ?? []).map((j, i) => toJournal(j, i)) as Journal[];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line bg-canvas pt-32 pb-16 sm:pt-36 lg:pt-40 lg:pb-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -right-40 -top-52 size-[40rem] rounded-full bg-[radial-gradient(circle,var(--color-brand-100)_0%,transparent_65%)] opacity-80" />
        </div>

        <Container width="wide">
          <Reveal>
            <Eyebrow>UORA Publications</Eyebrow>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="font-display mt-4 max-w-3xl text-display-sm font-semibold text-navy-950 sm:text-display-md lg:text-display-lg">
              Every journal in the portfolio
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-ink-600">
              International, peer-reviewed, open-access titles published
              quarterly by UORA Publications.
            </p>
          </Reveal>

          {journals.length > 0 && (
            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap gap-2">
                <Badge tone="brand">{journals.length} titles</Badge>
                <Badge tone="navy">Open access</Badge>
                <Badge>Peer reviewed</Badge>
                <Badge>Quarterly</Badge>
              </div>
            </Reveal>
          )}
        </Container>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <Container width="wide">
          {res.success && journals.length > 0 ? (
            <Reveal amount={0.05}>
              <div className="grid gap-8 md:grid-cols-2">
                {journals.map((journal) => (
                  <JournalCard key={journal.id} journal={journal} />
                ))}
              </div>
            </Reveal>
          ) : (
            <div className="py-24 text-center text-ink-500">
              <p>No active journals found.</p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
