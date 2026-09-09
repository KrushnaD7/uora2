import { BadgeCheck } from "lucide-react";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import ContactInfoCard from "./ContactInfoCard";
import ContactForm from "./ContactForm";
import { compliances, contactInfo } from "./data";

export default function Contact() {
  return (
    <Section id="contact" tone="canvas" size="lg" aria-labelledby="contact-title">
      <Container width="wide">
        <SectionHeader
          id="contact-title"
          size="lg"
          eyebrow="Get in touch"
          title={
            <>
              Talk to the editorial
              <span className="text-brand-700"> team</span>
            </>
          }
          description="Manuscript questions, editorial queries, institutional partnerships — reach the people who handle them directly."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
          {/* Contact details */}
          <Reveal amount={0.15}>
            <div className="flex h-full flex-col gap-6">
              <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-sm">
                {contactInfo.map((item) => (
                  <ContactInfoCard key={item.id} item={item} />
                ))}
              </ul>

              {/* Registration & compliance — the detail institutions verify */}
              <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-white">
                    <BadgeCheck className="size-[18px]" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-navy-950">
                      Registration &amp; compliance
                    </h3>
                    <p className="text-[12.5px] text-ink-500">
                      Official registrations and certifications
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
                  {compliances.map((item) => (
                    <div key={item.title} className="bg-ink-50/70 px-4 py-3.5">
                      <dt className="label-caps text-ink-400">{item.title}</dt>
                      <dd className="mt-1.5 break-all font-mono text-[11.5px] font-medium leading-5 text-navy-900">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal direction="left" delay={0.08} amount={0.15}>
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
