"use client";

import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="group flex size-10 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-navy-200 transition-[background-color,border-color,color] duration-300 hover:border-accent-400/50 hover:bg-white/10 hover:text-white"
    >
      <ArrowUp className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}
