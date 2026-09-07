import Link from "next/link";
import { ArrowLeft, RefreshCw, Award, CheckCircle2, UserCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata = {
  title: "Peer Review Process",
  description:
    "Detailed breakdown of UORA Publications' double-blind peer-review standards.",
};

export default function PeerReviewPage() {
  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden border-b border-line bg-canvas pt-32 pb-14 sm:pt-36 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -right-40 -top-52 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-brand-100)_0%,transparent_65%)] opacity-80" />
        </div>

        <Container width="wide">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="mt-8 max-w-3xl">
            <Eyebrow>Evaluation Process</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md lg:text-display-lg">
              Peer Review Process
            </h1>
            <p className="mt-5 text-[17px] leading-8 text-ink-600">
              Detailed breakdown of UORA Publications&apos; double-blind peer-review standards.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <Container width="narrow">
          <div className="space-y-10">
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <Award className="mr-2 inline text-brand-600" size={22} />
                1. Double-Blind Peer Review
              </h2>
              <p className="leading-8 text-ink-600">
                To ensure unbiased evaluation, UORA Publications utilizes a double-blind peer-review model. Under this system, the identity of the author(s) remains completely hidden from the reviewers, and similarly, the identities of the reviewers are kept confidential from the author(s).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <UserCheck className="mr-2 inline text-brand-600" size={22} />
                2. Selection of Reviewers
              </h2>
              <p className="leading-8 text-ink-600">
                Reviewers are selected based on their academic expertise, publication history, and research focus. We invite independent subject-matter specialists to evaluate the manuscript&apos;s originality, methodological validity, analysis of results, and overall scholarly contribution.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <RefreshCw className="mr-2 inline text-brand-600" size={22} />
                3. Review Workflow
              </h2>
              <p className="leading-8 text-ink-600">
                The review workflow proceeds in these key steps:
              </p>
              <div className="space-y-3 border-l-2 border-brand-300 pl-6">
                <p className="leading-8 text-ink-600"><strong>Step 1: Editor Assessment</strong> — Editors inspect the manuscript&apos;s formatting, scope match, and plagiarism index.</p>
                <p className="leading-8 text-ink-600"><strong>Step 2: Expert Review</strong> — Two or more peer reviewers write evaluations and make recommendation (Accept, Revisions, or Reject).</p>
                <p className="leading-8 text-ink-600"><strong>Step 3: Revision Cycle</strong> — Author updates their work in response to the reviewers&apos; constructive feedback.</p>
                <p className="leading-8 text-ink-600"><strong>Step 4: Editorial Decision</strong> — The journal Editor-in-Chief reviews the recommendations and delivers the final decision.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <CheckCircle2 className="mr-2 inline text-brand-600" size={22} />
                4. Final Decisions
              </h2>
              <p className="leading-8 text-ink-600">
                Final acceptance decisions rest solely with the Editorial Board. Any manuscript rejected by the reviewers due to structural flaws or lack of scientific integrity will not be published. Accepted papers transition directly into typesetting and online publication.
              </p>
            </section>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
