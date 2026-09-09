import { Brain, Globe2, ShieldCheck } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import CountUp from "@/components/ui/CountUp";

const pillars = [
  {
    icon: Brain,
    title: "Knowledge creation",
    description:
      "Fostering innovative research and scholarly work across diverse disciplines.",
  },
  {
    icon: ShieldCheck,
    title: "Ethical research",
    description:
      "Promoting integrity, transparency, and ethical standards in all academic endeavors.",
  },
  {
    icon: Globe2,
    title: "Global impact",
    description:
      "Creating sustainable solutions with worldwide reach and significance.",
  },
];

const impact = [
  { value: 20, suffix: "+", label: "Disciplines covered" },
  { value: 10, suffix: "+", label: "Years of impact" },
  { value: 100, suffix: "+", label: "Global collaborations" },
  { value: 1000, suffix: "+", label: "Researchers supported", compact: true },
];

export default function Vision() {
  return (
    <div id="vision" className="scroll-mt-28">
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* Statement */}
          <div className="relative border-b border-line bg-gradient-to-br from-navy-950 to-navy-900 px-7 py-10 text-white sm:px-10 sm:py-12 lg:border-b-0 lg:border-r">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-grid opacity-[0.08] mask-fade-y"
              style={{ filter: "invert(1)" }}
            />

            <div className="relative">
              <Reveal>
                <Eyebrow tone="inverse">Our vision</Eyebrow>
              </Reveal>

              <Reveal delay={0.06}>
                <p className="font-display mt-6 text-[1.6rem] font-medium leading-[1.28] tracking-[-0.015em] sm:text-[1.9rem]">
                  To become a leading global organisation fostering{" "}
                  <span className="text-accent-300">knowledge creation</span>,
                  innovation, and academic excellence across multidisciplinary
                  fields, while promoting ethical research, sustainability, and
                  inclusive development.
                </p>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="mt-7 max-w-md text-[15px] leading-7 text-navy-200">
                  UORA publishes high-quality peer-reviewed journals, books,
                  e-books, and study materials, serving the global academic and
                  research community through innovation, sustainability, and
                  knowledge sharing.
                </p>
              </Reveal>
            </div>
          </div>

          {/* Pillars */}
          <ul className="divide-y divide-line">
            {pillars.map(({ icon: Icon, title, description }, index) => (
              <Reveal
                as="li"
                key={title}
                delay={0.08 + index * 0.07}
                className="group flex gap-4 px-7 py-7 transition-colors duration-300 hover:bg-brand-50/40 sm:px-9"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-ink-50 text-brand-700 transition-colors duration-300 group-hover:border-brand-200 group-hover:bg-brand-50">
                  <Icon className="size-[18px]" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-navy-950">
                    {title}
                  </span>
                  <span className="mt-1.5 block text-[13.5px] leading-6 text-ink-500">
                    {description}
                  </span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* Impact figures */}
        {/* gap-px over a line-coloured bed gives exact hairlines at any column count */}
        <dl className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
          {impact.map((figure) => (
            <div key={figure.label} className="bg-ink-50/60 px-7 py-6 sm:px-6">
              <dd className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-navy-950">
                <CountUp
                  value={figure.value}
                  suffix={figure.suffix}
                  compact={figure.compact}
                />
              </dd>
              <dt className="mt-2 text-[12.5px] leading-5 text-ink-500">
                {figure.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
