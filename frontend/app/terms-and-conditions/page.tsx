import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "General terms governing use of UORA Publications platform and journals.",
};

export default function TermsAndConditionsPage() {
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
            <Eyebrow>Legal</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md lg:text-display-lg">
              Terms &amp; Conditions
            </h1>
            <p className="mt-5 text-[17px] leading-8 text-ink-600">
              Last updated: August 2026. General terms governing use of UORA Publications platform and journals.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <Container width="narrow">
          <div className="space-y-10">
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <Scale className="mr-2 inline text-brand-600" size={22} />
                1. Acceptance of Terms
              </h2>
              <p className="leading-8 text-ink-600">
                By accessing and using the UORA Publications website or registering as an author, reviewer, or editor, you agree to comply with and be bound by these Terms and Conditions and our Privacy Policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">2. Intellectual Property &amp; Licensing</h2>
              <p className="leading-8 text-ink-600">
                All published open-access articles are licensed under the Creative Commons Attribution (CC BY) license. Authors retain copyright ownership of their papers while granting UORA Publications the exclusive right of first publication and distribution.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">3. User Conduct &amp; Submissions</h2>
              <p className="leading-8 text-ink-600">
                Users must provide accurate registration and profile details. Submitted manuscripts must be original research. Attempting to submit plagiarized text or fraudulent data is a violation of these terms and will result in account suspension and article retraction.
              </p>
            </section>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
