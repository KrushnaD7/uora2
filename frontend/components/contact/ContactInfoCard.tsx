import { ArrowUpRight } from "lucide-react";

import type { ContactInfo } from "./data";

export default function ContactInfoCard({ item }: { item: ContactInfo }) {
  const Icon = item.icon;
  const external = item.href?.startsWith("http");

  const body = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-brand-700 transition-colors duration-300 group-hover:border-brand-200 group-hover:bg-brand-50">
        <Icon className="size-[18px]" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="label-caps block text-ink-400">{item.title}</span>
        <span className="mt-1.5 block text-[14.5px] leading-6 text-ink-700">
          {item.value}
        </span>
      </span>

      {item.href && (
        <ArrowUpRight className="mt-1 size-4 shrink-0 text-ink-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" />
      )}
    </>
  );

  const className =
    "group flex items-start gap-4 bg-white px-5 py-5 transition-colors duration-300 hover:bg-brand-50/40";

  return (
    <li>
      {item.href ? (
        <a
          href={item.href}
          className={className}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {body}
        </a>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  );
}
