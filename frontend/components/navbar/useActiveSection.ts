"use client";

import { useEffect, useState } from "react";

/**
 * Scroll-spy for the in-page navigation. Tracks which of `ids` currently owns
 * the reading position, using a viewport band just below the fixed navbar so a
 * section is highlighted when it is genuinely being read — not when its very
 * first pixel appears.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }

        if (visible.size === 0) return;

        // Whichever tracked section sits highest in the document order wins.
        const topmost = sections.find((section) => visible.has(section.id));
        if (topmost) setActive(topmost.id);
      },
      {
        rootMargin: "-96px 0px -55% 0px",
        threshold: [0, 0.15, 0.5],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
