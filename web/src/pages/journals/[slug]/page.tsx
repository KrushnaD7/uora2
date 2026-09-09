import { Link, useParams } from "@/lib/nav";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Mail,
  Phone,
  Globe,
  Layers,
  CalendarDays,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import PublicLayout from "@/components/layout/PublicLayout";
import { serverGetPublicJournals, serverGetPublicJournalBySlug } from "@/lib/server/data";
import type { JournalModel } from "@/lib/api/journals";
import { useAsyncData } from "@/lib/useAsyncData";
import PageLoading from "@/components/ui/PageLoading";

export default function JournalDetailPage() {
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

  const totalArticles =
    journal.volumes?.reduce(
      (acc, v) =>
        acc +
        (v.issues?.reduce(
          (a, i) => a + (i.articles?.length || 0),
          0
        ) || 0),
      0
    ) || 0;

  const meta = [
    { key: "ISSN", value: journal.issn || "Pending" },
    ...(journal.eissn ? [{ key: "eISSN", value: journal.eissn }] : []),
    { key: "Frequency", value: "Quarterly" },
    { key: "Language", value: "English" },
    { key: "Volumes", value: String(journal.volumes?.length || 0) },
    { key: "Articles", value: String(totalArticles) },
  ];

  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden border-b border-line bg-canvas pt-32 pb-14 sm:pt-36 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -right-40 -top-52 size-[40rem] rounded-full bg-[radial-gradient(circle,var(--color-brand-100)_0%,transparent_65%)] opacity-80" />
        </div>

        <Container width="wide">
          <Link href="/journals" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700">
            <ArrowLeft size={16} /> Back to Journals
          </Link>

          <div className="mt-8 max-w-4xl">
            <Eyebrow>{journal.shortName}</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md lg:text-display-lg">
              {journal.name}
            </h1>
            <p className="mt-6 max-w-3xl whitespace-pre-line text-[17px] leading-8 text-ink-600">
              {journal.settings?.about || "Universal peer-reviewed academic journal published by UORA Publications."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/login" size="lg">
                Submit Manuscript
              </Button>
              <Button href="#archive" variant="secondary" size="lg">
                Browse Volumes &amp; Issues
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <Container width="wide">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="space-y-10 lg:col-span-2">
              <article id="scope" className="rounded-2xl border border-line bg-white p-8 shadow-sm sm:p-10">
                <h2 className="font-display text-2xl font-semibold text-navy-950">Aims &amp; Scope</h2>
                <p className="mt-5 whitespace-pre-line leading-8 text-ink-600">
                  {journal.settings?.aimsScope || "This journal covers research and developments in multi-disciplinary areas. It aims to publish original research articles, reviews, case studies, and technical notes that make significant contributions to the field."}
                </p>
              </article>

              <article className="rounded-2xl border border-line bg-white p-8 shadow-sm sm:p-10">
                <h2 className="font-display text-2xl font-semibold text-navy-950">Publication Ethics</h2>
                <p className="mt-5 whitespace-pre-line leading-8 text-ink-600">
                  {journal.settings?.ethics || "UORA Publications is committed to maintaining the highest ethical standards of publishing. All manuscripts undergo a double-blind peer-review process, ensuring fairness, transparency, and scientific integrity."}
                </p>
              </article>

              <section id="archive">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Layers size={20} />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-navy-950">Archive</h2>
                    <p className="mt-0.5 text-sm text-ink-500">
                      Browse published volumes, issues and articles
                    </p>
                  </div>
                </div>

                {!journal.volumes || journal.volumes.length === 0 ? (
                  <div className="mt-8 rounded-2xl border border-line bg-white p-12 text-center shadow-sm">
                    <BookOpen size={48} className="mx-auto mb-4 text-ink-300" />
                    <p className="text-ink-500">No published volumes yet.</p>
                  </div>
                ) : (
                  <div className="mt-8 space-y-6">
                    {journal.volumes.map((volume) => (
                      <VolumeCard key={volume.id} journalSlug={journal.slug} volume={volume} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-8">
              <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
                <h3 className="font-display text-xl font-semibold text-navy-950">Journal Information</h3>
                <dl className="mt-6 divide-y divide-line">
                  {meta.map((item) => (
                    <div key={item.key} className="flex justify-between py-3 text-sm">
                      <dt className="font-medium text-ink-500">{item.key}</dt>
                      <dd className="font-semibold text-navy-900">{item.value}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between py-3 text-sm">
                    <dt className="font-medium text-ink-500">Peer Review</dt>
                    <dd className="font-semibold text-navy-900">Double-Blind</dd>
                  </div>
                  <div className="flex justify-between py-3 text-sm">
                    <dt className="font-medium text-ink-500">Open Access</dt>
                    <dd className="font-semibold text-brand-700">Yes (CC BY)</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
                <h3 className="font-display text-xl font-semibold text-navy-950">Quick Links</h3>
                <div className="mt-6 space-y-3 text-sm font-medium">
                  <Link href={`/journals/${journal.slug}/archives`} className="flex items-center justify-between text-ink-600 transition-colors hover:text-brand-700">
                    Archives <ChevronRight size={16} />
                  </Link>
                  <Link href={`/journals/${journal.slug}/guidelines`} className="flex items-center justify-between text-ink-600 transition-colors hover:text-brand-700">
                    Author Guidelines <ChevronRight size={16} />
                  </Link>
                  <Link href={`/journals/${journal.slug}/ethics`} className="flex items-center justify-between text-ink-600 transition-colors hover:text-brand-700">
                    Publication Ethics <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
                <h3 className="font-display text-xl font-semibold text-navy-950">Contact Details</h3>
                <div className="mt-6 space-y-4 text-sm text-ink-600">
                  {journal.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="shrink-0 text-ink-400" />
                      <span>{journal.email}</span>
                    </div>
                  )}
                  {journal.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="shrink-0 text-ink-400" />
                      <span>{journal.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="shrink-0 text-ink-400" />
                    <span>uorapublications.com</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}

function VolumeCard({
  journalSlug,
  volume,
}: {
  journalSlug: string;
  volume: NonNullable<JournalModel["volumes"]>[number];
}) {
  const issueCount = volume.issues?.length || 0;
  const articleCount =
    volume.issues?.reduce((a, i) => a + (i.articles?.length || 0), 0) || 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <Link
        href={`/journals/${journalSlug}/volumes/${volume.id}`}
        className="group flex flex-wrap items-center justify-between gap-4 p-6 transition-colors hover:bg-ink-50/60 lg:p-8"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-navy-950 font-bold text-white shadow-md">
            V{volume.volumeNumber}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-navy-950">
              Volume {volume.volumeNumber}
              <span className="ml-3 text-base font-normal text-ink-500">
                ({volume.year})
              </span>
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              {issueCount} Issue{issueCount === 1 ? "" : "s"} • {articleCount} Article
              {articleCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-2 text-sm font-semibold text-brand-700">
          View Volume
          <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>

      {volume.issues && volume.issues.length > 0 && (
        <div className="divide-y divide-line border-t border-line">
          {volume.issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/journals/${journalSlug}/volumes/${volume.id}/issues/${issue.id}`}
              className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-brand-50/40 lg:px-10"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <CalendarDays size={16} className="shrink-0 text-ink-400" />
                <span className="font-semibold text-ink-700">
                  Issue {issue.issueNumber}
                </span>
                {issue.title && (
                  <span className="text-ink-500">— {issue.title}</span>
                )}
                <span className="text-ink-400">
                  ({issue.articles?.length || 0} articles)
                </span>
              </div>
              <span className="flex items-center gap-1 text-sm text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">
                Open <ChevronRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
