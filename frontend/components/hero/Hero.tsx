"use client";

import dynamic from "next/dynamic";
import { ArrowRight, BookOpenCheck, FileCheck2, Scale } from "lucide-react";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";

const EditorialConsole = dynamic(() => import("./EditorialConsole"), {
  loading: () => (
    <div className="mx-auto h-[480px] w-full max-w-[34rem] rounded-2xl bg-ink-50 animate-pulse" />
  ),
});

const assurances = [
  { icon: Scale, label: "Double-blind peer review" },
  { icon: FileCheck2, label: "Permanent DOI on every article" },
  { icon: BookOpenCheck, label: "CC BY 4.0 open access" },
];

const figures = [
  { value: 25, suffix: "+", label: "Peer-reviewed journals" },
  { value: 10000, compact: true, suffix: "+", label: "Articles published" },
  { value: 50, suffix: "+", label: "Countries reached" },
  { value: 500, suffix: "+", label: "Editorial reviewers" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden bg-canvas pt-32 sm:pt-36 lg:pt-40"
    >
      {/* ---- Background: one grid, one light source, one horizon line ---- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-70 mask-radial-fade" />
        <div className="absolute -right-40 -top-56 size-[46rem] rounded-full bg-[radial-gradient(circle,var(--color-brand-100)_0%,transparent_65%)] opacity-80" />
        <div className="absolute -left-56 top-24 size-[38rem] rounded-full bg-[radial-gradient(circle,var(--color-navy-100)_0%,transparent_65%)] opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
      </div>

      <Container width="wide">
        <div className="grid items-center gap-14 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:gap-16 lg:pb-24 xl:gap-20">
          {/* ============================ Left ============================ */}
          <div className="max-w-xl lg:max-w-none">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 py-1.5 pl-1.5 pr-3.5 text-[12.5px] font-medium text-ink-700 shadow-xs backdrop-blur-sm">
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-white">
                  ISSN
                </span>
                Registered international academic publisher
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="font-display mt-7 text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.03em] text-navy-950 sm:text-display-lg lg:text-[4rem] xl:text-display-xl">
                Publish research
                <br className="hidden sm:block" /> the world can{" "}
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10 text-brand-700">cite</span>
                  <svg
                    aria-hidden
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1 left-0 h-2.5 w-full text-brand-300"
                    style={{ strokeDasharray: 200, strokeDashoffset: 200 }}
                  >
                    <path
                      className="animate-draw"
                      d="M2 8 C 45 2, 90 2, 132 6 S 180 10, 198 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="200"
                      strokeDashoffset="200"
                    />
                  </svg>
                </span>{" "}
                and trust.
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-7 max-w-xl text-[17px] leading-8 text-ink-600">
                UORA Publications gives researchers, universities and institutions
                a transparent route from manuscript to permanent scholarly record
                — rigorous peer review, a permanent DOI on every accepted article,
                and open access from the day it goes live.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/register" size="lg">
                  Submit your manuscript
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                </Button>
                <Button href="/journals" variant="secondary" size="lg">
                  Browse the journals
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {assurances.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 text-[13px] font-medium text-ink-600"
                  >
                    <Icon className="size-4 shrink-0 text-brand-600" />
                    {label}
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Figures sit on a rule rather than in four repeated boxes */}
            <Reveal delay={0.4}>
              <dl className="mt-12 grid grid-cols-2 gap-y-7 border-t border-line pt-8 sm:grid-cols-4 sm:gap-x-4">
                {figures.map((figure) => (
                  <div key={figure.label} className="sm:border-l sm:border-line sm:pl-4 sm:first:border-l-0 sm:first:pl-0">
                    <dt className="sr-only">{figure.label}</dt>
                    <dd>
                      <span className="block text-[26px] font-semibold leading-none tracking-[-0.02em] text-navy-950 sm:text-[28px]">
                        <CountUp
                          value={figure.value}
                          suffix={figure.suffix}
                          compact={figure.compact}
                        />
                      </span>
                      <span className="mt-2 block text-[12.5px] leading-5 text-ink-500">
                        {figure.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* ============================ Right =========================== */}
          <Reveal delay={0.18} className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
            <EditorialConsole />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
