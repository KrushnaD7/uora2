import { ArrowRight, Scale, ShieldCheck, Users2 } from "lucide-react";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import EditorCard from "./EditorCard";
import { editors } from "./editorData";

const commitments = [
  {
    icon: Scale,
    title: "Declared conflicts",
    description:
      "Editors recuse themselves from any submission where an interest exists.",
  },
  {
    icon: ShieldCheck,
    title: "Consistent standards",
    description:
      "The same review criteria apply to every manuscript, in every journal.",
  },
  {
    icon: Users2,
    title: "Reviewers on record",
    description:
      "Assessments are archived with the submission for full auditability.",
  },
];

export default function EditorialBoard() {
  return (
    <Section
      id="editorial"
      tone="white"
      size="lg"
      divider="bottom"
      aria-labelledby="editorial-title"
    >
      <Container width="wide">
        <SectionHeader
          id="editorial-title"
          size="lg"
          eyebrow="Editorial leadership"
          title={
            <>
              The people accountable for every
              <span className="text-brand-700"> decision</span>
            </>
          }
          description="Our editorial board maintains the standards of scholarly publishing through rigorous peer review, academic integrity and named responsibility."
          action={
            <Button href="/#contact" variant="secondary" size="lg">
              Join the review panel
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </Button>
          }
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {editors.map((editor, index) => (
            <Reveal key={editor.id} delay={index * 0.08} amount={0.15}>
              <EditorCard editor={editor} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} amount={0.2}>
          <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {commitments.map(({ icon: Icon, title, description }) => (
              <li key={title} className="bg-ink-50/60 px-6 py-6">
                <Icon className="size-[18px] text-brand-600" />
                <h3 className="mt-3.5 text-[14.5px] font-semibold text-navy-950">
                  {title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-6 text-ink-500">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
