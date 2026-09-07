"use client";

import {
  FileUp,
  Fingerprint,
  Globe2,
  PenLine,
  ScanSearch,
  Users2,
} from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: FileUp,
    title: "Manuscript submission",
    detail: "Structured intake with plagiarism and scope screening on upload.",
    duration: "Same day",
  },
  {
    icon: ScanSearch,
    title: "Editorial screening",
    detail: "Handling editor confirms scope, ethics compliance and format.",
    duration: "3–5 days",
  },
  {
    icon: Users2,
    title: "Double-blind peer review",
    detail: "Two to three subject experts assess rigour and contribution.",
    duration: "2–3 weeks",
  },
  {
    icon: PenLine,
    title: "Author revision",
    detail: "Consolidated reviewer report with a clear, itemised decision.",
    duration: "1–2 weeks",
  },
  {
    icon: Fingerprint,
    title: "DOI assignment",
    detail: "A permanent identifier is minted and metadata is deposited.",
    duration: "On acceptance",
  },
  {
    icon: Globe2,
    title: "Online publication",
    detail: "Open access under CC BY 4.0, indexed and citable immediately.",
    duration: "Within 7 days",
  },
];

/**
 * The submission-to-publication path, shown as a timeline with the time each
 * stage actually takes — the question authors ask first.
 */
export default function PublishingJourney() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-50/70 to-transparent"
      />

      <div className="relative border-b border-line px-6 py-6 sm:px-8">
        <p className="label-caps text-brand-700">Publishing journey</p>
        <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.015em] text-navy-950">
          From submission to permanent record
        </h3>
        <p className="mt-2 text-[14px] leading-6 text-ink-500">
          Every stage is tracked, timestamped and visible to the author.
        </p>
      </div>

      <ol className="relative px-6 py-7 sm:px-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const last = index === steps.length - 1;

          return (
            <Reveal
              key={step.title}
              as="li"
              delay={index * 0.06}
              amount={0.5}
              className={cn("relative flex gap-4", !last && "pb-7")}
            >
              {!last && (
                <span
                  aria-hidden
                  className="absolute left-[19px] top-11 h-[calc(100%-2.25rem)] w-px bg-gradient-to-b from-brand-200 to-line"
                />
              )}

              <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-700">
                <Icon className="size-[18px]" />
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h4 className="text-[15px] font-semibold text-navy-950">
                    <span className="mr-2 font-mono text-[11px] font-medium text-ink-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {step.title}
                  </h4>
                  <span className="shrink-0 rounded-md bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600">
                    {step.duration}
                  </span>
                </div>
                <p className="mt-1.5 text-[13.5px] leading-6 text-ink-500">
                  {step.detail}
                </p>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
