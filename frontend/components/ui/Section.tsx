import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "canvas" | "white" | "tint" | "dark";

/**
 * Section tones alternate down the page so adjacent sections never read as one
 * undifferentiated block. Keep the sequence deliberate rather than random.
 */
const tones: Record<Tone, string> = {
  canvas: "bg-canvas text-ink-900",
  white: "bg-white text-ink-900",
  tint: "bg-navy-50/60 text-ink-900",
  dark: "bg-navy-950 text-white",
};

const spacing = {
  sm: "py-16 sm:py-20",
  md: "py-20 sm:py-24 lg:py-28",
  lg: "py-24 sm:py-32 lg:py-36",
} as const;

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  tone?: Tone;
  size?: keyof typeof spacing;
  /** Hairline rules at the section seams; keeps the page rhythm legible. */
  divider?: "top" | "bottom" | "both" | "none";
  /** Faint blueprint grid, masked so it never meets an edge hard. */
  grid?: boolean;
  "aria-labelledby"?: string;
}

export default function Section({
  children,
  id,
  className,
  tone = "canvas",
  size = "md",
  divider = "none",
  grid = false,
  ...rest
}: SectionProps) {
  const dark = tone === "dark";
  const line = dark ? "border-white/10" : "border-line";

  return (
    <section
      id={id}
      className={cn(
        "relative isolate overflow-hidden",
        tones[tone],
        spacing[size],
        (divider === "top" || divider === "both") && `border-t ${line}`,
        (divider === "bottom" || divider === "both") && `border-b ${line}`,
        className
      )}
      {...rest}
    >
      {grid && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 mask-fade-y",
            dark ? "opacity-[0.07]" : "opacity-60",
            "bg-grid"
          )}
          style={dark ? { filter: "invert(1)" } : undefined}
        />
      )}
      {children}
    </section>
  );
}
