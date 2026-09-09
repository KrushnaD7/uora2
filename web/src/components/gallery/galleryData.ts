import {
  Award,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Handshake,
  Landmark,
  PenTool,
  Presentation,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const galleryCategories = [
  "All",
  "Conferences",
  "Workshops",
  "Editorial",
  "Community",
] as const;

export type GalleryCategory = (typeof galleryCategories)[number];

export interface GalleryItem {
  id: string;
  title: string;
  category: Exclude<GalleryCategory, "All">;
  caption: string;
  date: string;
  icon: LucideIcon;
  tone: "navy" | "brand" | "accent";
}

export const galleryItems: GalleryItem[] = [
  {
    id: "conf-2025",
    title: "UORA Research Conference 2025",
    category: "Conferences",
    caption: "Researchers presenting across ten disciplinary tracks.",
    date: "Feb 2026",
    icon: Presentation,
    tone: "navy",
  },
  {
    id: "editorial-meet",
    title: "Editorial Strategy Meet",
    category: "Editorial",
    caption: "Board members planning the 2026 publishing roadmap.",
    date: "Jan 2026",
    icon: Users,
    tone: "brand",
  },
  {
    id: "writing-workshop",
    title: "Author Workshop: Paper Writing",
    category: "Workshops",
    caption: "Hands-on guidance on drafting and structuring manuscripts.",
    date: "Dec 2025",
    icon: GraduationCap,
    tone: "accent",
  },
  {
    id: "review-training",
    title: "Peer Review Training Session",
    category: "Workshops",
    caption: "Building a rigorous, transparent reviewer community.",
    date: "Nov 2025",
    icon: Award,
    tone: "navy",
  },
  {
    id: "launch-ceremony",
    title: "Journal Launch Ceremony",
    category: "Community",
    caption: "Inauguration of the UORA Publications portfolio.",
    date: "Oct 2025",
    icon: BookOpen,
    tone: "brand",
  },
  {
    id: "manuscript-clinic",
    title: "Manuscript Clinic",
    category: "Workshops",
    caption: "One-on-one feedback sessions with senior editors.",
    date: "Sep 2025",
    icon: PenTool,
    tone: "accent",
  },
  {
    id: "review-retreat",
    title: "Board Review Retreat",
    category: "Editorial",
    caption: "Deep-dive deliberations on editorial standards.",
    date: "Aug 2025",
    icon: ClipboardList,
    tone: "navy",
  },
  {
    id: "annual-fair",
    title: "Annual Research Fair",
    category: "Conferences",
    caption: "Poster sessions and collaborations across institutions.",
    date: "Jul 2025",
    icon: Landmark,
    tone: "brand",
  },
  {
    id: "partner-summit",
    title: "Institutional Partners Summit",
    category: "Community",
    caption: "Forging university and association partnerships.",
    date: "Jun 2025",
    icon: Handshake,
    tone: "accent",
  },
  {
    id: "ai-seminar",
    title: "AI in Scholarly Publishing Seminar",
    category: "Conferences",
    caption: "Exploring ethics and innovation with emerging tools.",
    date: "May 2025",
    icon: Sparkles,
    tone: "navy",
  },
];
