import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  /** Renders a small brand rule before the text. */
  rule?: boolean;
  tone?: "brand" | "muted" | "inverse";
}

const tones = {
  brand: "text-brand-700",
  muted: "text-ink-500",
  inverse: "text-accent-300",
} as const;

/**
 * The section kicker. Uppercase, tracked-out, always paired with a heading —
 * it is the one element that signals "a new section starts here".
 */
export default function Eyebrow({
  children,
  className,
  rule = true,
  tone = "brand",
}: EyebrowProps) {
  return (
    <p className={cn("label-caps flex items-center gap-2.5", tones[tone], className)}>
      {rule && (
        <span
          aria-hidden
          className={cn(
            "h-px w-6 shrink-0",
            tone === "inverse" ? "bg-accent-400/50" : "bg-brand-400/60"
          )}
        />
      )}
      {children}
    </p>
  );
}
