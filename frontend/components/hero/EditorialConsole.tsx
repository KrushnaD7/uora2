"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Check, Clock3, Globe2, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A representative view of UORA's editorial system: one manuscript moving
 * through peer review, its reviewer state, and where its journal is read.
 * It exists to show what the platform does without the visitor reading prose,
 * so every value here mirrors the metrics quoted elsewhere on the page.
 */

const stages = [
  { label: "Submitted", state: "done" },
  { label: "Screening", state: "done" },
  { label: "Peer review", state: "active" },
  { label: "Revision", state: "todo" },
  { label: "Published", state: "todo" },
] as const;

const reviewers = [
  { initials: "A.K.", field: "Machine Learning", state: "Recommended" },
  { initials: "M.R.", field: "Clinical Informatics", state: "Recommended" },
  { initials: "S.D.", field: "Data Privacy", state: "In progress" },
] as const;

const regions = [
  { label: "Asia", share: 42 },
  { label: "Europe", share: 26 },
  { label: "Americas", share: 18 },
  { label: "Africa", share: 9 },
] as const;

const EditorialConsole = memo(function EditorialConsole() {
  const rise = useMemo(() => (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: {
      delay,
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }), []);

  return (
    <div className="relative">
      {/* Soft brand light behind the panel; one source, not a field of blobs */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(60%_55%_at_60%_35%,var(--color-brand-200)_0%,transparent_70%)] opacity-60 blur-2xl"
      />

      {/* Depth: two stacked plates behind the console */}
      <div
        aria-hidden
        className="absolute inset-x-6 -top-4 -z-10 h-24 rounded-2xl border border-line bg-white/70 shadow-sm"
      />
      <div
        aria-hidden
        className="absolute inset-x-12 -top-8 -z-20 h-24 rounded-2xl border border-line/70 bg-white/45"
      />

      <motion.div
        {...rise(0.1)}
        className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-xl"
      >
        {/* Console header */}
        <div className="flex items-center justify-between gap-3 border-b border-line bg-ink-50/70 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-brand-600" />
            <span className="truncate font-mono text-[11.5px] tracking-tight text-ink-600">
              UJCSAI-2026-0184
            </span>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-[11px] font-semibold text-accent-700">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping-slow rounded-full bg-accent-500" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent-500" />
            </span>
            In peer review
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {/* Manuscript */}
          <motion.div {...rise(0.18)}>
            <h3 className="text-[16px] font-semibold leading-snug text-navy-950 sm:text-[17px]">
              Federated Learning for Privacy-Preserving Clinical Decision
              Support
            </h3>
            <p className="mt-1.5 text-[13px] text-ink-500">
              Universal Journal of Computer Science &amp; Artificial
              Intelligence
            </p>
          </motion.div>

          {/* Stage rail */}
          <motion.div {...rise(0.26)} className="mt-5">
            <div className="relative">
              <div
                aria-hidden
                className="absolute left-0 right-0 top-[9px] h-px bg-line"
              />
              <motion.div
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 0.5 }}
                transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 right-0 top-[9px] h-px origin-left bg-brand-500"
              />

              <ol className="relative grid grid-cols-5 gap-1">
                {stages.map((stage, index) => {
                  const done = stage.state === "done";
                  const active = stage.state === "active";
                  return (
                    <li
                      key={stage.label}
                      className="flex flex-col items-center gap-2 text-center"
                    >
                      <motion.span
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 0.45 + index * 0.09,
                          duration: 0.4,
                          ease: [0.34, 1.42, 0.64, 1],
                        }}
                        className={cn(
                          "flex size-[18px] items-center justify-center rounded-full ring-4 ring-white",
                          done && "bg-brand-600 text-white",
                          active && "bg-accent-500 text-white",
                          !done && !active && "border border-line-strong bg-white"
                        )}
                      >
                        {done && <Check className="size-2.5" strokeWidth={3.5} />}
                        {active && (
                          <span className="size-1.5 rounded-full bg-white" />
                        )}
                      </motion.span>
                      <span
                        className={cn(
                          "text-[10.5px] leading-tight",
                          done || active
                            ? "font-semibold text-navy-900"
                            : "text-ink-400"
                        )}
                      >
                        {stage.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <p className="mt-3.5 flex items-center justify-end gap-1.5 text-[11px] text-ink-500">
              <Clock3 className="size-3" />
              <span>
                Day <span className="tnum font-semibold text-navy-800">12</span>{" "}
                of ~<span className="tnum font-semibold text-navy-800">21</span>{" "}
                to first decision
              </span>
            </p>
          </motion.div>

          {/* Two data panels */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <motion.div
              {...rise(0.38)}
              className="rounded-xl border border-line bg-ink-50/50 p-3.5"
            >
              <div className="flex items-baseline justify-between">
                <p className="label-caps text-ink-500">Reviewers</p>
                <p className="text-[11px] font-semibold text-brand-700 tnum">
                  2 / 3 returned
                </p>
              </div>

              <ul className="mt-3 space-y-2">
                {reviewers.map((reviewer, index) => {
                  const pending = reviewer.state === "In progress";
                  return (
                    <motion.li
                      key={reviewer.initials}
                      {...rise(0.46 + index * 0.07)}
                      className="flex items-center gap-2.5"
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                          pending
                            ? "bg-ink-200 text-ink-600"
                            : "bg-brand-100 text-brand-700"
                        )}
                      >
                        {reviewer.initials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11.5px] font-medium text-navy-900">
                          {reviewer.field}
                        </span>
                        <span
                          className={cn(
                            "block text-[10.5px]",
                            pending ? "text-ink-400" : "text-brand-600"
                          )}
                        >
                          {reviewer.state}
                        </span>
                      </span>
                      {pending ? (
                        <Clock3 className="size-3.5 shrink-0 text-ink-400" />
                      ) : (
                        <BadgeCheck className="size-3.5 shrink-0 text-brand-600" />
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>

            <motion.div
              {...rise(0.44)}
              className="rounded-xl border border-line bg-ink-50/50 p-3.5"
            >
              <div className="flex items-baseline justify-between">
                <p className="label-caps text-ink-500">Readership</p>
                <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy-800">
                  <Globe2 className="size-3" />
                  <span className="tnum">50+</span> countries
                </p>
              </div>

              <ul className="mt-3 space-y-2.5">
                {regions.map((region, index) => (
                  <li key={region.label}>
                    <div className="flex items-baseline justify-between text-[10.5px]">
                      <span className="font-medium text-ink-600">
                        {region.label}
                      </span>
                      <span className="tnum text-ink-500">{region.share}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${region.share}%` }}
                        transition={{
                          delay: 0.6 + index * 0.1,
                          duration: 0.9,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Console footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-ink-50/70 px-4 py-3 sm:px-5">
          <span className="font-mono text-[11px] tracking-tight text-ink-600">
            doi.org/10.4589/ujcsai.2026.0184
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-700">
            <BadgeCheck className="size-3.5" />
            DOI registered
          </span>
        </div>
      </motion.div>

      {/* A single satellite card, anchored to the panel's top corner. One is
          enough to break the silhouette; a second would start covering data.
          The entrance and the float live on separate elements — sharing one
          would let the CSS keyframes override Framer's transform. */}
      <motion.div
        {...rise(0.72)}
        className="pointer-events-none absolute -right-5 -top-7 hidden md:block lg:-right-7"
      >
        <div
          className="flex animate-float items-center gap-2.5 rounded-xl border border-line bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm"
          style={{ animationDelay: "1.6s" }}
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <Globe2 className="size-4" />
          </span>
          <span>
            <span className="block text-[11px] leading-4 text-ink-500">
              Open access
            </span>
            <span className="block text-[12.5px] font-semibold leading-4 text-navy-950">
              CC BY 4.0
            </span>
          </span>
        </div>
      </motion.div>
    </div>
  );
});

export default EditorialConsole;
