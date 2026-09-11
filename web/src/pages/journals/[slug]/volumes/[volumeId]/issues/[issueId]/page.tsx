import { Link, useParams } from "@/lib/nav";
import { useJournalSlug } from "@/lib/useJournalSlug";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Download,
  ExternalLink,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PublicLayout from "@/components/layout/PublicLayout";
import { serverGetPublicIssueById } from "@/lib/server/data";
import { IssueModel, ArticleModel } from "@/lib/api/journals";
import { useAsyncData } from "@/lib/useAsyncData";
import PageLoading from "@/components/ui/PageLoading";
import { getArticleDownloadUrl } from "@/lib/api/journals";

export default function IssueDetailPage() {
  const { issueId = "" } = useParams<{ issueId: string }>();
  const slug = useJournalSlug();
  const { data: res, loading } = useAsyncData(
    () => serverGetPublicIssueById<IssueModel>(issueId),
    [issueId]
  );

  if (loading || !res) return <PageLoading />;
  const issue = res.success ? res.data : null;

  if (!issue) {
    return (
      <PublicLayout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-6">
          <div className="mb-4 font-medium text-red-500">
            {res.message || "Issue not found"}
          </div>
          <Link href="/journals" className="flex items-center gap-2 text-brand-700 hover:underline">
            <ArrowLeft size={16} /> Back to journals
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const journalName = issue.journal?.name || "Journal";
  const journalSlug = issue.journal?.slug || slug;
  const volume = issue.volume;
  const articleCount = issue.articles?.length || 0;

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden border-b border-line bg-canvas pt-32 pb-14 sm:pt-36 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -right-40 -top-52 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-brand-100)_0%,transparent_65%)] opacity-80" />
        </div>

        <Container width="wide">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
            <Link href="/journals" className="transition-colors hover:text-navy-900">
              Journals
            </Link>
            <ChevronRight size={14} />
            <Link
              href={`/journals/${journalSlug}`}
              className="max-w-[180px] truncate transition-colors hover:text-navy-900"
            >
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
            <span className="font-medium text-navy-900">Issue {issue.issueNumber}</span>
          </nav>

          <div className="mt-8 max-w-4xl">
            <Eyebrow>
              {journalName}
              {volume ? ` · Volume ${volume.volumeNumber}` : ""}
            </Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md">
              Issue {issue.issueNumber}
              {issue.title && (
                <span className="ml-3 text-display-xs font-normal text-ink-500 sm:text-display-sm">
                  — {issue.title}
                </span>
              )}
            </h1>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="brand">{articleCount} Articles</Badge>
              {issue.publishedAt && (
                <Badge tone="navy">
                  Published{" "}
                  {new Date(issue.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Badge>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Article listing ── */}
      <section className="bg-white py-16 lg:py-20">
        <Container width="wide">
          {!issue.articles || issue.articles.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-12 text-center shadow-sm">
              <BookOpen size={48} className="mx-auto mb-4 text-ink-300" />
              <p className="text-ink-500">No articles published in this issue yet.</p>
            </div>
          ) : (
            <>
              {/* Section header */}
              <div className="mb-6 flex items-center gap-4">
                <h2 className="font-display text-xl font-semibold text-navy-950">
                  Articles
                </h2>
                <span className="h-px flex-1 bg-line" />
              </div>

              <div className="divide-y divide-line rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
                {issue.articles.map((article) => (
                  <ArticleRow key={article.id} article={article} />
                ))}
              </div>
            </>
          )}
        </Container>
      </section>
    </PublicLayout>
  );
}

function ArticleRow({ article }: { article: ArticleModel }) {
  const authors: string[] =
    (article as any).submission?.authors
      ?.slice()
      ?.sort((a: any, b: any) => a.authorOrder - b.authorOrder)
      ?.map((sa: any) => sa.author?.fullName)
      ?.filter(Boolean) ?? [];

  const doiUrl = article.doi
    ? article.doi.startsWith("http")
      ? article.doi
      : `https://doi.org/${article.doi}`
    : null;

  return (
    <div className="flex flex-col gap-3 px-6 py-5 sm:px-8 sm:py-6">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <Link
          href={`/articles/${article.id}`}
          className="flex-1 text-[17px] font-semibold leading-snug text-brand-700 transition-colors hover:text-brand-800 hover:underline underline-offset-2"
        >
          {article.title}
        </Link>
        {article.pages && (
          <span className="shrink-0 whitespace-nowrap text-sm font-medium text-ink-500">
            {article.pages}
          </span>
        )}
      </div>

      {/* DOI */}
      {doiUrl && (
        <div className="text-sm text-ink-500">
          <span className="font-medium">DOI: </span>
          <a
            href={doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 hover:underline underline-offset-2 inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {doiUrl}
            <ExternalLink size={11} className="opacity-60" />
          </a>
        </div>
      )}

      {/* Authors */}
      {authors.length > 0 && (
        <p className="text-sm text-ink-600">{authors.join(", ")}</p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button
          href={`/articles/${article.id}`}
          variant="secondary"
          size="sm"
        >
          Abstract
        </Button>
        {article.id && (
          <a
            href={getArticleDownloadUrl(article.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-sm transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            <Download size={13} />
            PDF
          </a>
        )}
      </div>
    </div>
  );
}
