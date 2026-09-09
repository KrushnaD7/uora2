import {
  BadgeCheck,
  Fingerprint,
  Globe2,
  ScrollText,
  Unlock,
  Users2,
} from "lucide-react";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

/**
 * The trust bar. Everything listed here is a commitment UORA states elsewhere
 * on the site — it is a summary, not a set of new claims.
 */
const standards = [
  { icon: ScrollText, label: "Peer reviewed", detail: "Double-blind" },
  { icon: Fingerprint, label: "DOI assignment", detail: "Prefix 10.4589" },
  { icon: Unlock, label: "Open access", detail: "CC BY 4.0" },
  { icon: BadgeCheck, label: "Ethical publishing", detail: "Transparent" },
  { icon: Globe2, label: "Global visibility", detail: "50+ countries" },
  { icon: Users2, label: "Editorial board", detail: "International" },
];

export default function Standards() {
  return (
    <section
      aria-label="Publishing standards"
      className="relative border-y border-line bg-white"
    >
      <Container width="wide">
        <Reveal amount={0.3}>
          <div className="grid grid-cols-2 divide-x divide-y divide-line/80 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
            {standards.map(({ icon: Icon, label, detail }) => (
              <div
                key={label}
                className="group flex items-center gap-3 px-4 py-5 transition-colors duration-300 hover:bg-ink-50/70 lg:px-5 lg:py-6"
              >
                <Icon className="size-[18px] shrink-0 text-brand-600 transition-transform duration-300 group-hover:scale-110" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold leading-tight text-navy-900">
                    {label}
                  </span>
                  <span className="mt-0.5 block truncate text-[11.5px] text-ink-500">
                    {detail}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
