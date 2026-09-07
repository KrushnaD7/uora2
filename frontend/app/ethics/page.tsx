import Link from "next/link";
import { ArrowLeft, Scale, ShieldCheck, HelpCircle, Eye } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata = {
  title: "Publication Ethics",
  description:
    "Ethical standards, code of conduct, and guidelines for authors, editors, and reviewers at UORA Publications.",
};

export default function PublicationEthicsPage() {
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
            <Eyebrow>Publishing Standards</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md lg:text-display-lg">
              Publication Ethics
            </h1>
            <p className="mt-5 text-[17px] leading-8 text-ink-600">
              Ethical standards, code of conduct, and guidelines for authors, editors, and reviewers.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <Container width="narrow">
          <div className="space-y-10">
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <ShieldCheck className="mr-2 inline text-brand-600" size={22} />
                1. Plagiarism &amp; Misconduct
              </h2>
              <p className="leading-8 text-ink-600">
                UORA Publications holds a zero-tolerance policy towards plagiarism, data fabrication, image manipulation, and duplicate publication. All submitted manuscripts are screened using professional anti-plagiarism software.
              </p>
              <p className="leading-8 text-ink-600">
                If plagiarism or fraudulent data is detected at any stage (before or after publication), the manuscript will be rejected immediately or retracted, and the author&apos;s institution may be notified.
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
              <ul className="list-inside list-disc space-y-2 pl-4 leading-8 text-ink-600">
                <li><strong>Ghost Authorship:</strong> Excluding contributors who meet authorship criteria is strictly forbidden.</li>
                <li><strong>Gift Authorship:</strong> Including individuals who did not contribute is unethical and prohibited.</li>
                <li><strong>Corresponding Author:</strong> Responsible for all communication with the journal during and after peer review.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <Eye className="mr-2 inline text-brand-600" size={22} />
                3. Conflicts of Interest
              </h2>
              <p className="leading-8 text-ink-600">
                All authors, editors, and reviewers must disclose any financial, personal, or professional relationships that could be perceived to influence their work or judgment. Examples include employment, consultancies, stock ownership, honoraria, or patent applications.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <HelpCircle className="mr-2 inline text-brand-600" size={22} />
                4. Code of Conduct for Reviewers &amp; Editors
              </h2>
              <p className="leading-8 text-ink-600">
                Reviewers must maintain strict confidentiality of all manuscripts under review and evaluate them objectively without personal bias. Editors hold full responsibility for the editorial decisions and must ensure a fair, unbiased, and transparent evaluation process.
              </p>
            </section>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
