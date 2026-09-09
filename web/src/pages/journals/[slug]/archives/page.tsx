import { Link, useParams } from "@/lib/nav";
import { ArrowLeft, Archive } from "lucide-react";

import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import PublicLayout from "@/components/layout/PublicLayout";
import ArchiveGrid from "@/components/archives/ArchiveGrid";
import { serverGetPublicJournalBySlug } from "@/lib/server/data";
import type { JournalModel } from "@/lib/api/journals";
import { useAsyncData } from "@/lib/useAsyncData";
import PageLoading from "@/components/ui/PageLoading";

export default function JournalArchivesPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: res, loading } = useAsyncData(
    () => serverGetPublicJournalBySlug<JournalModel>(slug),
    [slug]
  );

  if (loading || !res) return <PageLoading />;
  const journal = res.success ? res.data : null;

  if (!journal) {
    return (
      <PublicLayout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-6">
          <div className="mb-4 font-medium text-red-500">
            {res.message || "Journal not found"}
          </div>
          <Link href="/journals" className="flex items-center gap-2 text-brand-700 hover:underline">
            <ArrowLeft size={16} /> Back to all journals
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden border-b border-line bg-canvas pt-32 pb-14 sm:pt-36 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -right-40 -top-52 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-brand-100)_0%,transparent_65%)] opacity-80" />
        </div>

        <Container width="wide">
          <Link
            href={`/journals/${journal.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft size={16} /> Back to {journal.shortName}
          </Link>

          <div className="mt-8 max-w-3xl">
            <Eyebrow>{journal.shortName}</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md lg:text-display-lg">
              Archives
            </h1>
            <p className="mt-5 text-[17px] leading-8 text-ink-600">
              Every volume and issue published by {journal.name} lives here.
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
                {journal.shortName} archive
              </span>
            }
            description="As issues are published, they are catalogued below."
          />
          <Reveal delay={0.1}>
            <ArchiveGrid journalSlug={journal.slug} />
          </Reveal>
        </Container>
      </Section>
    </PublicLayout>
  );
}
