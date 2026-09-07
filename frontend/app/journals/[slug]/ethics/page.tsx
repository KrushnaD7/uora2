import Link from "next/link";
import { ArrowLeft, Scale, ShieldCheck, HelpCircle, Eye } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PublicLayout from "@/components/layout/PublicLayout";
import { serverGetPublicJournalBySlug } from "@/lib/server/data";
import type { JournalModel } from "@/lib/api/journals";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const res = await serverGetPublicJournalBySlug<JournalModel>(slug);
  const name = res.data?.name || "Journal";
  return {
    title: `Publication Ethics — ${name}`,
    description: `Ethical standards and code of conduct for ${name}.`,
  };
}

export default async function JournalEthicsPage({ params }: PageProps) {
  const { slug } = await params;
  const res = await serverGetPublicJournalBySlug<JournalModel>(slug);
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

  const customEthics = journal.settings?.ethics?.trim();

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
            <Eyebrow>Publishing Standards</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md lg:text-display-lg">
              Publication Ethics
            </h1>
            <p className="mt-5 text-[17px] leading-8 text-ink-600">
              Ethical standards and code of conduct for {journal.name}.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <Container width="narrow">
          {customEthics ? (
            <p className="whitespace-pre-line leading-8 text-ink-600">{customEthics}</p>
          ) : (
            <div className="space-y-10">
              <section className="space-y-3">
                <h2 className="font-display text-2xl font-semibold text-navy-950">
                  <ShieldCheck className="mr-2 inline text-brand-600" size={22} />
                  1. Plagiarism &amp; Misconduct
                </h2>
                <p className="leading-8 text-ink-600">
                  {journal.shortName} holds a zero-tolerance policy towards plagiarism, data fabrication, image manipulation, and duplicate publication. All submitted manuscripts are screened using professional anti-plagiarism software.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-2xl font-semibold text-navy-950">
                  <Scale className="mr-2 inline text-brand-600" size={22} />
                  2. Authorship &amp; Contributions
                </h2>
                <p className="leading-8 text-ink-600">
                  Authorship must be limited to those who have made significant intellectual contributions to the study&apos;s conception, design, execution, or interpretation.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-2xl font-semibold text-navy-950">
                  <Eye className="mr-2 inline text-brand-600" size={22} />
                  3. Conflicts of Interest
                </h2>
                <p className="leading-8 text-ink-600">
                  All authors, editors, and reviewers must disclose any financial, personal, or professional relationships that could be perceived to influence their work or judgment.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-2xl font-semibold text-navy-950">
                  <HelpCircle className="mr-2 inline text-brand-600" size={22} />
                  4. Code of Conduct for Reviewers &amp; Editors
                </h2>
                <p className="leading-8 text-ink-600">
                  Reviewers must maintain strict confidentiality of all manuscripts under review and evaluate them objectively. Editors must ensure a fair, unbiased, and transparent evaluation process.
                </p>
              </section>
            </div>
          )}
        </Container>
      </section>
    </PublicLayout>
  );
}
