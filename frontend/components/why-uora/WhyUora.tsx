import {
  Award,
  Clock3,
  FileCheck2,
  Globe,
  ShieldCheck,
  Users,
} from "lucide-react";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import ReviewFlow from "./ReviewFlow";

const supporting = [
  {
    icon: Globe,
    title: "Open access publishing",
    description:
      "Freely readable worldwide from day one, which lifts readership and citation potential.",
  },
  {
    icon: FileCheck2,
    title: "A DOI for every article",
    description:
      "A permanent identifier and deposited metadata make each paper reliably citable.",
  },
  {
    icon: Users,
    title: "International editorial board",
    description:
      "Respected academics and researchers accountable for publication quality.",
  },
  {
    icon: Clock3,
    title: "Fast editorial process",
    description:
      "A streamlined workflow returns timely decisions without loosening review standards.",
  },
];

/** Card sizing is deliberate: the two data-backed claims get the wide cells. */
export default function WhyUora() {
  return (
    <Section
      id="why-uora"
      tone="canvas"
      size="lg"
      divider="bottom"
      aria-labelledby="why-title"
    >
      <Container width="wide">
        <SectionHeader
          id="why-title"
          size="lg"
          align="center"
          eyebrow="Why publish with UORA"
          title={
            <>
              Publish with <span className="text-brand-700">confidence</span>
            </>
          }
          description="Academic rigour, ethical standards and global accessibility — the three things that decide whether research gets read, cited and trusted."
        />

        {/* Two bands: one wide feature row, then an even row of four. Mixing
            all six into a single 3-column grid leaves a ragged trailing cell. */}
        <div className="mt-14 grid gap-4 lg:grid-cols-3 lg:gap-5">
          {/* ---- Lead cell: peer review, with the flow made visible ---- */}
          <Reveal className="lg:col-span-2" amount={0.15}>
            <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-200/70 bg-gradient-to-br from-brand-50/80 via-white to-white p-7 shadow-md transition-shadow duration-400 hover:shadow-lg sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
                  <ShieldCheck className="size-5" />
                </span>
                <span className="label-caps rounded-full border border-brand-200 bg-white px-3 py-1.5 text-brand-700">
                  Core principle
                </span>
              </div>

              <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.015em] text-navy-950">
                Rigorous, double-blind peer review
              </h3>
              <p className="mt-3 max-w-lg text-[14.5px] leading-7 text-ink-600">
                Every manuscript is assessed by qualified subject experts who do
                not know the author, and whose identities the author never
                learns. Independent verdicts converge into one consolidated,
                itemised editorial decision.
              </p>

              <div className="mt-7 rounded-xl border border-line bg-white/80 p-4 backdrop-blur-sm sm:p-5">
                <ReviewFlow />
              </div>
            </article>
          </Reveal>

          {/* ---- Tall cell: the reach claim, with figures ---- */}
          <Reveal delay={0.06} amount={0.15}>
            <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-navy-950 p-7 text-white shadow-lg sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-grid opacity-[0.09] mask-fade-y"
                style={{ filter: "invert(1)" }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[radial-gradient(circle,var(--color-accent-600)_0%,transparent_70%)] opacity-40"
              />

              <div className="relative">
                <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-accent-300 ring-1 ring-white/15">
                  <Award className="size-5" />
                </span>

                <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.015em]">
                  Global research visibility
                </h3>
                <p className="mt-3 text-[14.5px] leading-7 text-navy-200">
                  Published articles reach researchers, institutions and
                  professionals across the world through unrestricted access.
                </p>

                <ul className="mt-7 space-y-3">
                  {[
                    "Deposited, machine-readable metadata",
                    "Permanent DOI resolution",
                    "No paywall, no embargo period",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[13.5px] leading-6 text-navy-100"
                    >
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-400"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="relative mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10">
                <div className="bg-navy-900 px-4 py-4">
                  <dd className="text-[24px] font-semibold leading-none tracking-[-0.02em]">
                    <CountUp value={50} suffix="+" />
                  </dd>
                  <dt className="mt-2 text-[11.5px] leading-4 text-navy-300">
                    Countries reached
                  </dt>
                </div>
                <div className="bg-navy-900 px-4 py-4">
                  <dd className="text-[24px] font-semibold leading-none tracking-[-0.02em]">
                    <CountUp value={100} suffix="%" />
                  </dd>
                  <dt className="mt-2 text-[11.5px] leading-4 text-navy-300">
                    Open access
                  </dt>
                </div>
              </dl>
            </article>
          </Reveal>

        </div>

        {/* ---- Supporting cells: an even four, so the band never runs ragged ---- */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {supporting.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={0.04 * index} amount={0.2}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-400 ease-out hover:-translate-y-1 hover:border-brand-300/70 hover:shadow-lg sm:p-7">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-accent-500 transition-transform duration-500 ease-out group-hover:scale-x-100"
                />

                <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-ink-50 text-brand-700 transition-colors duration-300 group-hover:border-brand-200 group-hover:bg-brand-50">
                  <Icon className="size-[18px]" />
                </span>

                <h3 className="mt-5 text-[16px] font-semibold leading-snug text-navy-950">
                  {title}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-6 text-ink-500">
                  {description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
