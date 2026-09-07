import Link from "next/link";

import type { FooterLink } from "./data";

export default function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <h3 className="label-caps text-accent-300">{title}</h3>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.title}>
            <Link
              href={link.href}
              className="group inline-flex items-center text-[14px] text-navy-200 transition-colors duration-200 hover:text-white"
            >
              <span
                aria-hidden
                className="mr-0 h-px w-0 bg-accent-400 transition-all duration-300 ease-out group-hover:mr-2 group-hover:w-3"
              />
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
