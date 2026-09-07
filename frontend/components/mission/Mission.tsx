import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";

const missions = [
  {
    title: "Publish high-quality journals",
    description:
      "To publish high-quality peer-reviewed journals, books, and study materials across Science, Technology, Management, Arts, Medical Sciences, and allied disciplines.",
  },
  {
    title: "Academic consultancy",
    description:
      "To provide consultancy services in academic research, project documentation, and comprehensive report preparation for organizations and institutions.",
  },
  {
    title: "Ethical publishing",
    description:
      "To ensure ethical publishing practices, rigorous peer-review standards, and dissemination of credible scholarly work.",
  },
  {
    title: "Support researchers",
    description:
      "To support researchers, educators, and institutions in generating impactful knowledge and promoting lifelong learning.",
  },
  {
    title: "Global collaboration",
    description:
      "To contribute to the global academic and research community through collaboration, innovation, and knowledge sharing.",
  },
];

export default function Mission() {
  return (
    <div id="mission" className="scroll-mt-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] lg:gap-16">
        <div className="lg:pt-2">
          <Reveal>
            <Eyebrow>Our mission</Eyebrow>
          </Reveal>

          <Reveal delay={0.06}>
            <h3 className="font-display mt-4 text-[1.75rem] font-semibold leading-[1.14] tracking-[-0.02em] text-navy-950 sm:text-[2rem]">
              Five commitments we hold ourselves to
            </h3>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-5 text-[15.5px] leading-7 text-ink-600">
              We are dedicated to advancing global knowledge through rigorous
              scholarship, ethical publishing, and collaborative innovation.
              Each commitment is measurable, published openly and reviewed by our
              editorial board every volume.
            </p>
          </Reveal>
        </div>

        {/* Hairline grid of commitments — deliberately flat, no card shadows */}
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {missions.map((mission, index) => (
            <Reveal
              as="li"
              key={mission.title}
              delay={index * 0.06}
              amount={0.3}
              className="group relative bg-white p-6 transition-colors duration-300 hover:bg-brand-50/50 sm:p-7"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-brand-600 transition-transform duration-400 ease-out group-hover:scale-x-100"
              />

              <span className="font-mono text-[11px] font-medium text-brand-600">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h4 className="mt-3 text-[16px] font-semibold leading-snug text-navy-950">
                {mission.title}
              </h4>

              <p className="mt-2.5 text-[13.5px] leading-6 text-ink-500">
                {mission.description}
              </p>
            </Reveal>
          ))}

          {/* Balances the odd count so the grid never ends on a ragged cell */}
          <li
            aria-hidden
            className="hidden bg-ink-50/60 bg-grid-sm p-7 sm:block"
          />
        </ol>
      </div>
    </div>
  );
}
