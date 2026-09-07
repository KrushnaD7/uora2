import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How UORA Publications collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
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
            <Eyebrow>Legal</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md lg:text-display-lg">
              Privacy Policy
            </h1>
            <p className="mt-5 text-[17px] leading-8 text-ink-600">
              Last updated: August 2026. How UORA Publications collects, uses, and protects your personal data.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <Container width="narrow">
          <div className="space-y-10">
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">
                <Shield className="mr-2 inline text-brand-600" size={22} />
                1. Information We Collect
              </h2>
              <p className="leading-8 text-ink-600">
                We collect personal information that you voluntarily provide to us when registering on the UORA Publications portal, submitting manuscripts, reviewing papers, or contacting us. This information includes:
              </p>
              <ul className="list-inside list-disc space-y-2 pl-4 leading-8 text-ink-600">
                <li>Full Name and Email Address</li>
                <li>Institution and Designation</li>
                <li>ORCID iD, Mobile Number, and Country</li>
                <li>Manuscripts, reviews, and related uploaded files</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">2. How We Use Your Information</h2>
              <p className="leading-8 text-ink-600">
                We use the collected information for purposes necessary to run the peer-reviewed publishing system, including:
              </p>
              <ul className="list-inside list-disc space-y-2 pl-4 leading-8 text-ink-600">
                <li>Managing manuscript submission and the peer-review process</li>
                <li>Verifying authorship and communicating editorial decisions</li>
                <li>Formatting and indexing published research papers</li>
                <li>Sending platform notifications and academic updates</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-navy-950">3. Data Security &amp; Storage</h2>
              <p className="leading-8 text-ink-600">
                We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Published articles are permanently archived and indexed globally. Personal account credentials are password-hashed.
              </p>
            </section>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
