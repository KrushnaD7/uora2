import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Badge from "@/components/ui/Badge";
import PublicLayout from "@/components/layout/PublicLayout";
import { serverGetPublicVolumeById } from "@/lib/server/data";
import { VolumeModel } from "@/lib/api/journals";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string; volumeId: string }>;
}

export default async function VolumeDetailPage({ params }: PageProps) {
  const { slug, volumeId } = await params;
  const res = await serverGetPublicVolumeById<VolumeModel>(volumeId);
  const volume = res.success ? res.data : null;

  if (!volume) {
    return (
      <PublicLayout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-6">
          <div className="mb-4 font-medium text-red-500">
            {res.message || "Volume not found"}
          </div>
          <Link href="/journals" className="flex items-center gap-2 text-brand-700 hover:underline">
            <ArrowLeft size={16} /> Back to journals
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const journalName = volume.journal?.name || "Journal";
  const issueCount = volume.issues?.length || 0;
  const articleCount =
    volume.issues?.reduce((a, i) => a + (i.articles?.length || 0), 0) || 0;

  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden border-b border-line bg-canvas pt-32 pb-14 sm:pt-36 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -left-40 -top-52 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-navy-100)_0%,transparent_65%)] opacity-70" />
        </div>

        <Container width="wide">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
            <Link href="/journals" className="transition-colors hover:text-navy-900">
              Journals
            </Link>
            <ChevronRight size={14} />
            <Link href={`/journals/${slug}`} className="max-w-[200px] truncate transition-colors hover:text-navy-900">
              {journalName}
            </Link>
            <ChevronRight size={14} />
            <span className="font-medium text-navy-900">
              Volume {volume.volumeNumber}
            </span>
          </nav>

          <div className="mt-8 max-w-4xl">
            <Eyebrow>{journalName}</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md">
              Volume {volume.volumeNumber}
              <span className="ml-4 font-normal text-ink-400">({volume.year})</span>
            </h1>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="brand">{issueCount} Issues</Badge>
              <Badge tone="navy">{articleCount} Articles</Badge>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <Container width="wide">
          {!volume.issues || volume.issues.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-12 text-center shadow-sm">
              <BookOpen size={48} className="mx-auto mb-4 text-ink-300" />
              <p className="text-ink-500">No published issues in this volume yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {volume.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
                >
                  <Link
                    href={`/journals/${slug}/volumes/${volume.id}/issues/${issue.id}`}
                    className="group flex flex-wrap items-center justify-between gap-4 p-6 transition-colors hover:bg-ink-50/60 lg:p-8"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <CalendarDays size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-navy-950">
                          Issue {issue.issueNumber}
                        </h3>
                        {issue.title && (
                          <p className="text-sm text-ink-500">{issue.title}</p>
                        )}
                        {issue.publishedAt && (
                          <p className="mt-0.5 text-xs text-ink-400">
                            Published{" "}
                            {new Date(issue.publishedAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-ink-500">
                        {issue.articles?.length || 0} articles
                      </span>
                      <ChevronRight
                        size={20}
                        className="text-brand-700 transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </Link>

                  {issue.articles && issue.articles.length > 0 && (
                    <div className="divide-y divide-line border-t border-line">
                      {issue.articles.map((article) => (
                        <Link
                          key={article.id}
                          href={`/articles/${article.id}`}
                          className="group flex items-start justify-between gap-4 px-6 py-4 transition-colors hover:bg-brand-50/40 lg:px-10"
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                            <div>
                              <p className="font-semibold text-ink-800 transition-colors group-hover:text-brand-700">
                                {article.title}
                              </p>
                              {article.pages && (
                                <p className="mt-0.5 text-xs text-ink-400">
                                  Pages {article.pages}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight
                            size={16}
                            className="mt-1 shrink-0 text-ink-300 transition-colors group-hover:text-brand-700"
                          />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </PublicLayout>
  );
}