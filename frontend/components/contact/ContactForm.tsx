"use client";

import { useId, useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CONTACT_EMAIL } from "./data";

const topics = [
  "General enquiry",
  "Manuscript submission",
  "Editorial or peer review",
  "Collaboration or partnership",
] as const;

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

const fieldClass = (invalid: boolean) =>
  cn(
    "w-full rounded-xl border bg-white px-4 text-[15px] text-navy-900 shadow-xs transition-[border-color,box-shadow] duration-200",
    "placeholder:text-ink-400",
    "focus:outline-none focus:ring-4",
    invalid
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-line focus:border-brand-500 focus:ring-brand-100"
  );

/**
 * There is no submission endpoint yet, so rather than fake a success state the
 * form validates locally and hands a fully composed message to the visitor's
 * mail client. Swap `handoff` for a server action once an inbox exists.
 */
export default function ContactForm() {
  const id = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [mailtoHref, setMailtoHref] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const topic = String(data.get("topic") ?? topics[0]);
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (name.length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      next.email = "Please enter a valid email address.";
    if (message.length < 20)
      next.message = "Please give us at least a couple of sentences.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const firstInvalid = Object.keys(next)[0];
      document.getElementById(`${id}-${firstInvalid}`)?.focus();
      return;
    }

    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `${topic} — ${name}`
    )}&body=${encodeURIComponent(`${message}\n\n—\n${name}\n${email}`)}`;

    setMailtoHref(href);
    setSent(true);
    window.location.href = href;
  };

  if (sent) {
    return (
      <div className="flex h-full flex-col items-start justify-center rounded-2xl border border-brand-200 bg-brand-50/60 p-8 sm:p-10">
        <span className="flex size-12 items-center justify-center rounded-xl bg-brand-600 text-white">
          <CheckCircle2 className="size-6" />
        </span>
        <h3 className="mt-6 text-[20px] font-semibold text-navy-950">
          Your message is ready to send
        </h3>
        <p className="mt-3 max-w-md text-[14.5px] leading-7 text-ink-600">
          We have opened your email client with the message composed. If nothing
          happened, send it directly to{" "}
          <a
            href={mailtoHref}
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-7 text-[14px] font-semibold text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800"
        >
          Write another message
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-lg sm:p-8">
      <h3 className="text-[20px] font-semibold tracking-[-0.015em] text-navy-950">
        Send us a message
      </h3>
      <p className="mt-2.5 text-[14px] leading-6 text-ink-500">
        Questions about submissions, collaborations or publishing? Our editorial
        team replies within two working days.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${id}-name`}
              className="mb-2 block text-[13px] font-semibold text-navy-900"
            >
              Full name
            </label>
            <input
              id={`${id}-name`}
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Dr. Anita Kulkarni"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${id}-name-error` : undefined}
              className={cn(fieldClass(Boolean(errors.name)), "h-12")}
            />
            {errors.name && (
              <p
                id={`${id}-name-error`}
                role="alert"
                className="mt-2 text-[12.5px] text-red-600"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`${id}-email`}
              className="mb-2 block text-[13px] font-semibold text-navy-900"
            >
              Email address
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@university.edu"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${id}-email-error` : undefined}
              className={cn(fieldClass(Boolean(errors.email)), "h-12")}
              suppressHydrationWarning
            />
            {errors.email && (
              <p
                id={`${id}-email-error`}
                role="alert"
                className="mt-2 text-[12.5px] text-red-600"
              >
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor={`${id}-topic`}
            className="mb-2 block text-[13px] font-semibold text-navy-900"
          >
            What is this about?
          </label>
          <select
            id={`${id}-topic`}
            name="topic"
            defaultValue={topics[0]}
            className={cn(fieldClass(false), "h-12 appearance-none pr-10")}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b7f90' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
            }}
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`${id}-message`}
            className="mb-2 block text-[13px] font-semibold text-navy-900"
          >
            Message
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={5}
            placeholder="Tell us about your manuscript, the journal you have in mind, or the question you need answered."
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? `${id}-message-error` : undefined}
            className={cn(
              fieldClass(Boolean(errors.message)),
              "min-h-36 resize-y py-3.5 leading-7"
            )}
          />
          {errors.message && (
            <p
              id={`${id}-message-error`}
              role="alert"
              className="mt-2 text-[12.5px] text-red-600"
            >
              {errors.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" block>
          <Send className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          Send message
        </Button>

        <p className="text-center text-[12px] leading-5 text-ink-400">
          We use your details only to reply to this enquiry.
        </p>
      </form>
    </div>
  );
}
