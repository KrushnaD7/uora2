import Link from "next/link";
import { ArrowLeft, Archive, BookOpenCheck } from "lucide-react";

import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import PublicLayout from "@/components/layout/PublicLayout";
import ArchiveGrid from "@/components/archives/ArchiveGrid";

export const metadata = {
  title: "Archives",
  description:
    "Browse the archive of UORA Publications volumes, issues, and past collections across all journals.",
};

export default function ArchivesPage() {
  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden border-b border-line bg-canvas pt-32 pb-14 sm:pt-36 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -right-40 -top-52 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-brand-100)_0%,transparent_65%)] opacity-80" />
        </div>

        <Container width="wide">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="mt-8 max-w-3xl">
            <Eyebrow>Collections</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md lg:text-display-lg">
              Archives
            </h1>
            <p className="mt-5 text-[17px] leading-8 text-ink-600">
              Every volume and issue published by UORA Publications lives here.
              Filter by year to trace the evolution of our journals.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="white" size="md" grid>
        <Container width="wide">
          <SectionHeader
            eyebrow="Volumes &amp; Issues"
            title={
              <span className="flex items-center gap-3">
                <Archive className="size-8 text-brand-600" />
                Journal archive
              </span>
            }
            description="As issues are published, they are catalogued below and linked back to their journal pages."
          />
          <Reveal delay={0.1}>
            <ArchiveGrid />
          </Reveal>
        </Container>
      </Section>

      <Section tone="dark" size="md" grid>
        <Container width="wide">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <Eyebrow tone="inverse">Explore current work</Eyebrow>
              <h2 className="font-display mt-4 text-display-sm font-semibold text-white sm:text-display-md">
                Looking for the latest research?
              </h2>
              <p className="mt-5 text-[17px] leading-8 text-navy-200">
                Every journal in the UORA Publications portfolio is open access
                and peer reviewed. Browse active journals to discover freshly
                accepted articles before they reach the archive.
              </p>
            </Reveal>

            <Reveal delay={0.1} direction="left">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
                  <BookOpenCheck className="size-7" />
                </div>
                <h3 className="font-display mt-5 text-xl font-semibold text-white">
                  Browse our journals
                </h3>
                <p className="mt-3 leading-7 text-navy-200">
                  Open access, peer-reviewed research across science,
                  technology, management, humanities, and more.
                </p>
                <Link
                  href="/journals"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-brand-50"
                >
                  Explore journals
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </PublicLayout>
  );
}
