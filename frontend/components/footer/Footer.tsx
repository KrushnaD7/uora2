import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import Container from "@/components/ui/Container";
import Brand from "@/components/navbar/Brand";
import FooterColumn from "./FooterColumn";
import BackToTop from "./BackToTop";
import {
  authorLinks,
  contactLines,
  exploreLinks,
  legalLinks,
  socialLinks,
} from "./data";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/components/contact/data";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-navy-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-grid opacity-[0.06]"
          style={{ filter: "invert(1)" }}
        />
        <div className="absolute -left-40 top-0 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-brand-800)_0%,transparent_68%)] opacity-50" />
      </div>

      <Container width="wide">
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Brand tone="dark" />

            <p className="mt-6 max-w-sm text-[14.5px] leading-7 text-navy-200">
              Universal Oneness in Research Association publishes
              multidisciplinary research through ethical peer review, academic
              integrity and open global access.
            </p>

            <ul className="mt-7 flex gap-2.5">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.name}>
                    <Link
                      href={social.href}
                      aria-label={social.name}
                      className="flex size-10 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-navy-200 transition-[background-color,border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent-400/50 hover:bg-white/10 hover:text-white"
                    >
                      <Icon width={15} height={15} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Explore" links={exploreLinks} />
          </div>

          <div className="lg:col-span-3">
            <FooterColumn title="For authors" links={authorLinks} />
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="label-caps text-accent-300">Contact</h3>

            <ul className="mt-5 space-y-4 text-[14px]">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-navy-400" />
                <address className="not-italic leading-6 text-navy-200">
                  {contactLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-navy-400" />
                <a
                  href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                  className="text-navy-200 transition-colors hover:text-white"
                >
                  {CONTACT_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-navy-400" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="break-all text-navy-200 transition-colors hover:text-white"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-6 border-t border-white/10 py-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[13px] leading-6 text-navy-300">
            © {year} Universal Oneness in Research Association (UORA). All
            rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {legalLinks.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-navy-300 transition-colors hover:text-white"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>

            <BackToTop />
          </div>
        </div>
      </Container>
    </footer>
  );
}
