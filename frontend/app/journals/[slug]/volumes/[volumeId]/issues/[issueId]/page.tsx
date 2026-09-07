import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FileText,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Badge from "@/components/ui/Badge";
import PublicLayout from "@/components/layout/PublicLayout";
import { serverGetPublicIssueById } from "@/lib/server/data";
import { IssueModel } from "@/lib/api/journals";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string; volumeId: string; issueId: string }>;
}

export default async function IssueDetailPage({ params }: PageProps) {
  const { slug, issueId } = await params;
  const res = await serverGetPublicIssueById<IssueModel>(issueId);
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
      <section className="relative isolate overflow-hidden border-b border-line bg-canvas pt-32 pb-14 sm:pt-36 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -right-40 -top-52 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-brand-100)_0%,transparent_65%)] opacity-80" />
        </div>

        <Container width="wide">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
            <Link href="/journals" className="transition-colors hover:text-navy-900">
              Journals
            </Link>
            <ChevronRight size={14} />
            <Link href={`/journals/${journalSlug}`} className="max-w-[180px] truncate transition-colors hover:text-navy-900">
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
            <Eyebrow>{journalName}{volume ? ` · Volume ${volume.volumeNumber}` : ""}</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md">
              Issue {issue.issueNumber}
            </h1>
            {issue.title && (
              <p className="mt-4 text-lg leading-8 text-ink-600">{issue.title}</p>
            )}
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

      <section className="bg-white py-16 lg:py-20">
        <Container width="wide">
          {!issue.articles || issue.articles.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-12 text-center shadow-sm">
              <BookOpen size={48} className="mx-auto mb-4 text-ink-300" />
              <p className="text-ink-500">No articles published in this issue yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {issue.articles.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="group flex items-start justify-between gap-6 rounded-2xl border border-line bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300/70 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-sm font-bold text-ink-500">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold leading-snug text-ink-800 transition-colors group-hover:text-brand-700">
                        {article.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
                        {article.doi && (
                          <span className="inline-flex items-center gap-1">
                            <FileText size={12} /> DOI: {article.doi}
                          </span>
                        )}
                        {article.pages && <span>Pages: {article.pages}</span>}
                        <span>
                          Published{" "}
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="hidden shrink-0 items-center gap-2 rounded-xl border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                    View
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </PublicLayout>
  );
}