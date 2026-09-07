"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 24 },
  down: { x: 0, y: -24 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
  none: { x: 0, y: 0 },
};

type Tag = "div" | "section" | "article" | "li" | "span" | "p" | "header";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  /** Fraction of the element that must be visible before it animates in. */
  amount?: number;
  as?: Tag;
}

/**
 * The single scroll-reveal primitive for the site. Uses a lightweight
 * IntersectionObserver and CSS transitions (no animation library), so nothing
 * heavy is added to the critical path. Movement collapses to a plain fade when
 * the visitor prefers reduced motion.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = "up",
  amount = 0.2,
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      startTransition(() => setVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          startTransition(() => setVisible(true));
          observer.disconnect();
        }
      },
      { threshold: amount, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [amount]);

  const Tag = as;
  const offset = offsets[direction];
  const delayMs = delay * 1000;
  const durationMs = duration * 1000;

  const style: CSSProperties = {
    opacity: isPending || visible ? 1 : 0,
    transform:
      isPending || visible
        ? "none"
        : `translate3d(${offset.x}px, ${offset.y}px, 0)`,
    transition: `opacity ${durationMs}ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform ${durationMs}ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
    willChange: "opacity, transform",
  };

  return (
    <Tag ref={ref as never} data-reveal={isPending || visible ? "" : undefined} className={className} style={style}>
      {children}
    </Tag>
  );
}
