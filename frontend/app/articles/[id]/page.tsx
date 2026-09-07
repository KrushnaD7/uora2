import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Download,
  Hash,
  Users,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PublicLayout from "@/components/layout/PublicLayout";
import ArticlePdfSection from "@/components/articles/ArticlePdfSection";
import {
  serverGetPublicArticles,
  serverGetPublicArticleById,
} from "@/lib/server/data";
import {
  getArticleDownloadUrl,
  ArticleModel,
} from "@/lib/api/journals";

export const revalidate = 3600;

export async function generateStaticParams() {
  const res = await serverGetPublicArticles<ArticleModel[]>();
  return (res.data ?? []).map((article) => ({ id: article.id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await serverGetPublicArticleById<ArticleModel>(id);
  const article = res.success ? res.data : null;

  if (!article) {
    return (
      <PublicLayout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-6">
          <div className="mb-4 font-medium text-red-500">
            {res.message || "Article not found"}
          </div>
          <Link href="/journals" className="flex items-center gap-2 text-brand-700 hover:underline">
            <ArrowLeft size={16} /> Back to journals
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const journalName = article.journal?.name || "Journal";
  const journalSlug = article.journal?.slug || "";
  const issue = article.issue;
  const volume = issue?.volume;
  const authors = article.submission?.authors || [];
  const downloadUrl = getArticleDownloadUrl(article.id);
  const viewUrl = `${downloadUrl}?view=1`;
  const hasPdf = Boolean(article.pdfUrl);

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
            <Link href={`/journals/${journalSlug}`} className="max-w-[160px] truncate transition-colors hover:text-navy-900">
              {journalName}
            </Link>
            <ChevronRight size={14} />
            {volume && (
              <>
                <Link
                  href={`/journals/${journalSlug}/volumes/${volume.id}`}
                  className="transition-colors hover:text-navy-900"
                >
                  Volume {volume.volumeNumber}
                </Link>
                <ChevronRight size={14} />
              </>
            )}
            {issue && (
              <>
                <Link
                  href={`/journals/${journalSlug}/volumes/${volume?.id}/issues/${issue.id}`}
                  className="transition-colors hover:text-navy-900"
                >
                  Issue {issue.issueNumber}
                </Link>
                <ChevronRight size={14} />
              </>
            )}
            <span className="max-w-[220px] truncate font-medium text-navy-900">
              {article.title}
            </span>
          </nav>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <article className="lg:col-span-2">
              <div className="rounded-2xl border border-line bg-white p-8 shadow-sm lg:p-12">
                <div className="flex flex-wrap items-center gap-2">
                  {issue && (
                    <Badge tone="brand">
                      <CalendarDays size={14} /> Issue {issue.issueNumber}
                      {volume ? ` · Vol ${volume.volumeNumber}` : ""}
                    </Badge>
                  )}
                  <Badge>
                    <BookOpen size={14} /> {journalName}
                  </Badge>
                </div>

                <h1 className="font-display mt-6 text-display-sm font-semibold leading-tight text-navy-950 sm:text-display-md">
                  {article.title}
                </h1>

                {authors.length > 0 && (
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    {authors.map((a) => (
                      <span
                        key={a.author.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-ink-100 px-3 py-1.5 text-sm font-medium text-ink-700"
                      >
                        <Users size={14} className="text-ink-400" />
                        {a.author.fullName}
                        {a.isCorresponding && (
                          <span className="text-xs text-brand-700">(Corresponding)</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                <div className="my-8 h-px bg-line" />

                {article.submission?.abstract ? (
                  <div>
                    <h2 className="font-display text-xl font-semibold text-navy-950">Abstract</h2>
                    <p className="mt-3 leading-8 text-ink-600">
                      {article.submission.abstract}
                    </p>
                  </div>
                ) : (
                  <p className="italic text-ink-500">
                    Abstract not available for this article.
                  </p>
                )}
              </div>
            </article>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-navy-950">Article Access</h3>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-ink-500">Status</dt>
                    <dd className="font-semibold text-brand-700">Published (Open Access)</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-ink-500">Published</dt>
                    <dd className="font-semibold text-navy-900">
                      {new Date(article.publishedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                  {article.doi && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-ink-500">DOI</dt>
                      <dd className="break-all text-right font-semibold text-brand-700">
                        {article.doi}
                      </dd>
                    </div>
                  )}
                  {article.pages && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-ink-500">Pages</dt>
                      <dd className="font-semibold text-navy-900">{article.pages}</dd>
                    </div>
                  )}
                </dl>

                <ArticlePdfSection
                  title={article.title}
                  downloadUrl={downloadUrl}
                  viewUrl={viewUrl}
                  hasPdf={hasPdf}
                />
              </div>

              <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-navy-950">Journal Details</h3>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-ink-500">Journal</dt>
                    <dd>
                      <Link
                        href={`/journals/${journalSlug}`}
                        className="text-right font-semibold text-brand-700 hover:underline"
                      >
                        {journalName}
                      </Link>
                    </dd>
                  </div>
                  {article.journal?.issn && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-ink-500">ISSN</dt>
                      <dd className="font-semibold text-navy-900">{article.journal.issn}</dd>
                    </div>
                  )}
                  {issue && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-ink-500">Issue</dt>
                      <dd className="font-semibold text-navy-900">Issue {issue.issueNumber}</dd>
                    </div>
                  )}
                  {volume && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-ink-500">Volume</dt>
                      <dd className="font-semibold text-navy-900">
                        Volume {volume.volumeNumber} ({volume.year})
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {article.submission?.paperId && (
                <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
                  <div className="flex items-center gap-3 text-sm text-ink-600">
                    <Hash size={16} className="text-ink-400" />
                    <span>
                      Paper ID:{" "}
                      <span className="font-semibold text-navy-900">{article.submission.paperId}</span>
                    </span>
                  </div>
                </div>
              )}
            </aside>
          </div>

          <div className="mt-12">
            <Link
              href={issue ? `/journals/${journalSlug}/volumes/${volume?.id}/issues/${issue.id}` : `/journals/${journalSlug}`}
              className="inline-flex items-center gap-2 text-ink-500 transition-colors hover:text-navy-900"
            >
              <ArrowLeft size={16} /> Back to {issue ? `Issue ${issue.issueNumber}` : journalName}
            </Link>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
