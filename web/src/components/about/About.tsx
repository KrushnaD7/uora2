import { ArrowRight } from "lucide-react";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import PublishingJourney from "./PublishingJourney";

const metrics = [
  { label: "Average review time", value: "3–4 weeks" },
  { label: "Acceptance rate", value: "38%" },
  { label: "Open access", value: "100%", highlight: true },
];

export default function About() {
  return (
    <Section id="about" tone="canvas" size="lg" aria-labelledby="about-title">
      <Container width="wide">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-20">
          {/* ---------------------------- Narrative --------------------------- */}
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <Eyebrow>About UORA</Eyebrow>
            </Reveal>

            <Reveal delay={0.06}>
              <h2
                id="about-title"
                className="font-display mt-4 text-[2rem] font-semibold leading-[1.1] tracking-[-0.024em] text-navy-950 sm:text-display-sm lg:text-[2.9rem]"
              >
                An international publisher built on
                <span className="text-brand-700"> ethical scholarship</span>
              </h2>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 text-[17px] leading-8 text-ink-600">
                UORA Publications advances scientific knowledge through
                transparent peer review, ethical publishing practice and
                open-access dissemination. Researchers get a trusted platform to
                publish original work and reach a global academic audience.
              </p>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-5 text-[17px] leading-8 text-ink-600">
                By pairing rigorous editorial standards with modern publishing
                infrastructure, we help universities, institutions and
                independent researchers maximise the visibility, credibility and
                measurable impact of their work.
              </p>
            </Reveal>

            {/* Operating metrics — a rule-separated row, not another card grid */}
            <Reveal delay={0.2}>
              {/* Stacked label/value rows on phones; three columns once the
                  values stop wrapping. */}
              <dl className="mt-10 divide-y divide-line border-y border-line sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-baseline justify-between gap-4 py-3.5 sm:block sm:px-4 sm:py-5 sm:first:pl-0"
                  >
                    <dt className="text-[13px] leading-5 text-ink-500 sm:text-[12px] sm:leading-4">
                      {metric.label}
                    </dt>
                    <dd
                      className={
                        metric.highlight
                          ? "text-[19px] font-semibold tracking-[-0.02em] text-brand-700 sm:mt-2 sm:text-[22px]"
                          : "text-[19px] font-semibold tracking-[-0.02em] text-navy-950 sm:mt-2 sm:text-[22px]"
                      }
                    >
                      {metric.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button href="/journals" variant="contrast">
                  About the publisher
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                </Button>
                <Button href="/#journals" variant="ghost">
                  See what we publish
                </Button>
              </div>
            </Reveal>
          </div>

          {/* ------------------------- Publishing journey -------------------- */}
          <Reveal delay={0.1} direction="left">
            <PublishingJourney />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
