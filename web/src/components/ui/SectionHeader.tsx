import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Rendered to the right of the heading on large screens (e.g. a link). */
  action?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** `md` for most sections; `lg` for the two or three tent-pole sections. */
  size?: "md" | "lg";
  id?: string;
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  tone = "light",
  size = "md",
  id,
  className,
}: SectionHeaderProps) {
  const centered = align === "center";
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        centered
          ? "items-center text-center"
          : action
            ? "lg:flex-row lg:items-end lg:justify-between lg:gap-12"
            : "",
        className
      )}
    >
      <div className={cn("max-w-2xl", centered && "flex flex-col items-center")}>
        {eyebrow && (
          <Reveal>
            <Eyebrow tone={dark ? "inverse" : "brand"} rule={!centered}>
              {eyebrow}
            </Eyebrow>
          </Reveal>
        )}

        <Reveal delay={0.06}>
          <h2
            id={id}
            className={cn(
              "font-display mt-4 font-semibold",
              size === "lg"
                ? "text-display-sm sm:text-display-md lg:text-display-lg"
                : "text-[2rem] leading-[1.12] tracking-[-0.022em] sm:text-display-sm lg:text-[2.75rem]",
              dark ? "text-white" : "text-navy-950"
            )}
          >
            {title}
          </h2>
        </Reveal>

        {description && (
          <Reveal delay={0.12}>
            <p
              className={cn(
                "mt-5 text-[17px] leading-8",
                dark ? "text-navy-200" : "text-ink-600"
              )}
            >
              {description}
            </p>
          </Reveal>
        )}
      </div>

      {action && (
        <Reveal delay={0.18} className="shrink-0">
          {action}
        </Reveal>
      )}
    </div>
  );
}
