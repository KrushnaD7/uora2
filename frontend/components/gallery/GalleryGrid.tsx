"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  galleryCategories,
  galleryItems,
  type GalleryCategory,
  type GalleryItem,
} from "./galleryData";

const tones: Record<GalleryItem["tone"], { bg: string; glow: string }> = {
  navy: {
    bg: "bg-[radial-gradient(120%_120%_at_20%_10%,#1c3d5f_0%,#0c2340_55%,#081a30_100%)]",
    glow: "bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.18)_0%,transparent_55%)]",
  },
  brand: {
    bg: "bg-[radial-gradient(120%_120%_at_20%_10%,#8f5a2e_0%,#5c3415_55%,#47270d_100%)]",
    glow: "bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.16)_0%,transparent_55%)]",
  },
  accent: {
    bg: "bg-[radial-gradient(120%_120%_at_20%_10%,#2d5f5c_0%,#123f3c_55%,#0b2f2c_100%)]",
    glow: "bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.16)_0%,transparent_55%)]",
  },
};

const labels: Record<Exclude<GalleryCategory, "All">, string> = {
  Conferences: "Conferences",
  Workshops: "Workshops",
  Editorial: "Editorial",
  Community: "Community",
};

function GalleryTile({ item }: { item: GalleryItem }) {
  const Icon = item.icon;
  const tone = tones[item.tone];

  return (
    <motion.figure
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10",
        tone.bg
      )}
    >
      <div aria-hidden className={cn("absolute inset-0", tone.glow)} />

      <Icon
        aria-hidden
        className="absolute -right-6 -top-6 size-40 text-white/[0.07] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-60 bg-grid mask-radial-fade"
      />

      <figcaption className="absolute inset-x-0 bottom-0 p-5">
        <Badge tone="inverse" size="sm" className="mb-2.5">
          {labels[item.category]}
        </Badge>
        <p className="font-display text-lg font-semibold leading-snug text-white">
          {item.title}
        </p>
        <p className="mt-1 text-[13px] leading-5 text-navy-200">
          {item.caption}
        </p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-white/40">
          {item.date}
        </p>
      </figcaption>
    </motion.figure>
  );
}

export default function GalleryGrid() {
  const [active, setActive] = useState<GalleryCategory>("All");

  const filtered =
    active === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter gallery by category"
        className="flex flex-wrap items-center gap-2"
      >
        {galleryCategories.map((category) => {
          const selected = category === active;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(category)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-200",
                selected
                  ? "border-brand-700 bg-brand-700 text-white shadow-sm"
                  : "border-line bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      <motion.div
        layout
        className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.map((item) => (
          <GalleryTile key={item.id} item={item} />
        ))}
      </motion.div>
    </div>
  );
}
