"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Milliseconds. */
  duration?: number;
  /** Renders e.g. 10000 as "10K". */
  compact?: boolean;
  className?: string;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function format(value: number, compact: boolean) {
  if (compact && value >= 1000) {
    // Drop a trailing ".0" so 10000 reads as "10K", not "10.0K"
    const rounded = Math.round((value / 1000) * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}K`;
  }
  return Math.floor(value).toLocaleString("en-US");
}

/**
 * The single count-up implementation for every metric on the site.
 *
 * The final value is rendered in the markup, so it is correct for search
 * engines, for visitors without JavaScript, and for anyone who prefers reduced
 * motion. The animation then drives the text node imperatively — treating the
 * DOM as the external system it is, rather than re-rendering React 60 times a
 * second.
 */
export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1600,
  compact = false,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const target = node.querySelector<HTMLElement>("[data-countup-value]");
    if (!target) return;

    target.textContent = format(0, compact);

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          target.textContent = format(easeOutCubic(progress) * value, compact);
          if (progress < 1) frame = requestAnimationFrame(step);
          else target.textContent = format(value, compact);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      target.textContent = format(value, compact);
    };
  }, [compact, duration, value]);

  return (
    <span ref={ref} className={cn("tnum", className)}>
      {prefix}
      <span data-countup-value>{format(value, compact)}</span>
      {suffix}
    </span>
  );
}
