import Image from "next/image";
import { GraduationCap, Mail, Phone, UserRound } from "lucide-react";

import type { Editor } from "./types";

export default function EditorCard({ editor }: { editor: Editor }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-md transition-[transform,box-shadow,border-color] duration-400 ease-out hover:-translate-y-1 hover:border-brand-300/70 hover:shadow-xl sm:flex-row">
      {/* Portrait */}
      <div className="relative shrink-0 overflow-hidden bg-ink-100 sm:w-[42%] lg:w-[38%]">
        {editor.image ? (
          <Image
            src={editor.image}
            alt={`Portrait of ${editor.name}`}
            width={520}
            height={640}
            sizes="(min-width: 1024px) 240px, (min-width: 640px) 40vw, 100vw"
            className="h-56 w-full scale-[1.14] object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.19] sm:h-full sm:min-h-[22rem]"
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-brand-50 to-navy-50 sm:h-full sm:min-h-[22rem]">
            <UserRound className="size-14 text-navy-300" />
          </div>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/45 via-transparent to-transparent"
        />

        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-navy-900 shadow-sm backdrop-blur-sm">
          {editor.role}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="text-[19px] font-semibold leading-snug tracking-[-0.01em] text-navy-950">
          {editor.name}
        </h3>
        <p className="mt-1.5 text-[13.5px] font-medium text-brand-700">
          {editor.designation}
        </p>

        {editor.remit && (
          <p className="mt-4 text-[13.5px] leading-6 text-ink-600">
            {editor.remit}
          </p>
        )}

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-ink-50/70 p-4">
          <GraduationCap className="mt-0.5 size-4 shrink-0 text-brand-600" />
          <p className="text-[12.5px] leading-6 text-ink-600">
            {editor.affiliation}
          </p>
        </div>

        <dl className="mt-5 space-y-2.5 border-t border-line pt-5">
          <div className="flex items-start gap-3">
            <dt className="mt-0.5">
              <Mail className="size-4 text-ink-400" />
              <span className="sr-only">Email</span>
            </dt>
            <dd className="min-w-0 flex-1 space-y-1">
              {editor.emails.map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="block truncate text-[12.5px] text-ink-600 transition-colors hover:text-brand-700"
                >
                  {email}
                </a>
              ))}
            </dd>
          </div>

          <div className="flex items-center gap-3">
            <dt>
              <Phone className="size-4 text-ink-400" />
              <span className="sr-only">Phone</span>
            </dt>
            <dd>
              <a
                href={`tel:${editor.phone.replace(/\s/g, "")}`}
                className="text-[12.5px] font-medium text-navy-900 transition-colors hover:text-brand-700"
              >
                {editor.phone}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
