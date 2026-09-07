import Link from "next/link";
import { ArrowLeft, Camera, ImagePlus } from "lucide-react";

import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import PublicLayout from "@/components/layout/PublicLayout";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const metadata = {
  title: "Gallery",
  description:
    "Moments from UORA Publications conferences, workshops, editorial meetings, and community events.",
};

export default function GalleryPage() {
  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden border-b border-line bg-canvas pt-32 pb-14 sm:pt-36 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -right-40 -top-52 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-brand-100)_0%,transparent_65%)] opacity-80" />
        </div>

        <Container width="wide">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="mt-8 max-w-3xl">
            <Eyebrow>Press &amp; Events</Eyebrow>
            <h1 className="font-display mt-4 text-display-sm font-semibold text-navy-950 sm:text-display-md lg:text-display-lg">
              Gallery
            </h1>
            <p className="mt-5 text-[17px] leading-8 text-ink-600">
              A glimpse into the conferences, workshops, editorial deliberations,
              and community moments that shape UORA Publications.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="white" size="md" grid>
        <Container width="wide">
          <SectionHeader
            eyebrow="Moments"
            title={
              <span className="flex items-center gap-3">
                <Camera className="size-8 text-brand-600" />
                Highlights from our events
              </span>
            }
            description="Filter by category to explore the people and discussions behind our publishing programme."
          />
          <Reveal delay={0.1}>
            <GalleryGrid />
          </Reveal>
        </Container>
      </Section>

      <Section tone="dark" size="md" grid>
        <Container width="wide">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <Eyebrow tone="inverse">Share your moments</Eyebrow>
              <h2 className="font-display mt-4 text-display-sm font-semibold text-white sm:text-display-md">
                Were you at a UORA event?
              </h2>
              <p className="mt-5 text-[17px] leading-8 text-navy-200">
                We document our conferences, workshops, and partner summits.
                Photographs from our programmes are featured here as they are
                published. To contribute media or raise an image-related request,
                write to our editorial office.
              </p>
            </Reveal>

            <Reveal delay={0.1} direction="left">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
                  <ImagePlus className="size-7" />
                </div>
                <h3 className="font-display mt-5 text-xl font-semibold text-white">
                  Contact our editorial office
                </h3>
                <p className="mt-3 leading-7 text-navy-200">
                  Email{" "}
                  <a
                    href="mailto:contact@uorapublications.com"
                    className="font-medium text-brand-300 underline-offset-4 transition-colors hover:text-white"
                  >
                    contact@uorapublications.com
                  </a>{" "}
                  with any gallery-related enquiries.
                </p>
                <Button href="/#contact" variant="secondary" size="md" className="mt-6">
                  Get in touch
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </PublicLayout>
  );
}
