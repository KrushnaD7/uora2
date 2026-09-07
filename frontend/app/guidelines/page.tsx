import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, ShieldCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata = {
  title: "Author Guidelines",
  description:
    "Complete instructions for preparing and submitting your manuscript to UORA Publications.",
};

export default function AuthorGuidelinesPage() {
  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden border-b border-line bg-canvas pt-32 pb-14 sm:pt-36 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -left-40 -top-52 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-navy-100)_0%,transparent_65%)] opacity-70" />
        </div>

        <Container width="wide">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="mt-8 max-w-3xl">
            <Eyebrow>For Authors</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md lg:text-display-lg">
              Author Guidelines
            </h1>
            <p className="mt-5 text-[17px] leading-8 text-ink-600">
              Complete instructions for preparing and submitting your manuscript to UORA Publications.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <Container width="narrow">
          <div className="space-y-10">
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <FileText className="mr-2 inline text-brand-600" size={22} />
                1. Manuscript Preparation
              </h2>
              <p className="leading-8 text-ink-600">
                Manuscripts must be written in clear, concise English. Authors should prepare their papers in Microsoft Word (DOC/DOCX) or LaTeX format according to the journal template.
              </p>
              <ul className="list-inside list-disc space-y-2 pl-4 leading-8 text-ink-600">
                <li><strong>Title:</strong> Should be specific, descriptive, and concise.</li>
                <li><strong>Abstract:</strong> A single paragraph of 150–250 words summarizing the objectives, methods, results, and conclusions.</li>
                <li><strong>Keywords:</strong> 4 to 6 relevant keywords for indexing.</li>
                <li><strong>Structure:</strong> Typically includes Introduction, Methodology, Results and Discussion, Conclusion, and References.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <BookOpen className="mr-2 inline text-brand-600" size={22} />
                2. Formatting and Style
              </h2>
              <p className="leading-8 text-ink-600">
                Please adhere strictly to the following formatting requirements:
              </p>
              <ul className="list-inside list-disc space-y-2 pl-4 leading-8 text-ink-600">
                <li>Font: Times New Roman or Arial, 12pt, double-spaced.</li>
                <li>Figures and Tables: Must be numbered sequentially, with clear captions, and placed near their first citation in the text.</li>
                <li>References: Cite references in the text by number in square brackets (e.g., [1]) and list them sequentially in the References section following the IEEE or APA style guidelines.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <ShieldCheck className="mr-2 inline text-brand-600" size={22} />
                3. Ethical Submission &amp; Declaration
              </h2>
              <p className="leading-8 text-ink-600">
                By submitting a manuscript, the authors declare that:
              </p>
              <ul className="list-inside list-disc space-y-2 pl-4 leading-8 text-ink-600">
                <li>The work is original and has not been published elsewhere.</li>
                <li>The paper is not currently under consideration by another journal.</li>
                <li>All co-authors have approved the submission and contributed significantly to the research.</li>
                <li>All sources of funding and potential conflicts of interest are disclosed.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-line bg-canvas p-6 sm:p-8">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div>
                  <h4 className="text-lg font-semibold text-navy-950">Ready to Submit?</h4>
                  <p className="mt-1 text-sm text-ink-500">Log in to your author portal to upload your manuscript file.</p>
                </div>
                <Button href="/login" size="lg">
                  Submit Paper
                </Button>
              </div>
            </section>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
