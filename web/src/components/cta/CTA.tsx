import { ArrowRight } from "lucide-react";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

const facts = [
  { value: "21 days", label: "Average time to first decision" },
  { value: "On acceptance", label: "Permanent DOI assigned" },
  { value: "CC BY 4.0", label: "Open access from day one" },
];

export default function CTA() {
  return (
    <Section tone="dark" size="lg" aria-labelledby="cta-title">
      {/* One light source, top-centre, so the panel reads as lit rather than busy */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.07] mask-fade-y" style={{ filter: "invert(1)" }} />
        <div className="absolute left-1/2 top-0 size-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-brand-700)_0%,transparent_62%)] opacity-45" />
        <div className="absolute -bottom-40 right-0 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-accent-800)_0%,transparent_65%)] opacity-40" />
      </div>

      <Container>
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <Eyebrow tone="inverse" rule={false}>
              Begin your publishing journey
            </Eyebrow>
          </Reveal>

          <Reveal delay={0.06}>
            <h2
              id="cta-title"
              className="font-display mt-5 max-w-3xl text-display-sm font-semibold text-white sm:text-display-md lg:text-display-lg"
            >
              Turn your research into the
              <span className="text-accent-300"> permanent record</span>
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-navy-200">
              Submit through a transparent peer-review process, backed by
              international editorial standards and open-access publishing that
              puts your work in front of readers in more than fifty countries.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/register" size="lg">
                Submit your paper
                <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
              </Button>
              <Button href="/journals" variant="inverse" size="lg">
                Explore the journals
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.24} className="w-full">
            <dl className="mx-auto mt-16 grid w-full max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="bg-navy-950/80 px-6 py-6">
                  <dd className="text-[19px] font-semibold tracking-[-0.015em] text-white">
                    {fact.value}
                  </dd>
                  <dt className="mt-2 text-[12.5px] leading-5 text-navy-300">
                    {fact.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
