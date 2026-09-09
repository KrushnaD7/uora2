export interface NavItem {
  label: string;
  href: string;
  /** Section id this link maps to, for scroll-spy highlighting. */
  section?: string;
}

export const navItems: NavItem[] = [
  { label: "About", href: "/#about", section: "about" },
  { label: "Vision", href: "/#vision", section: "vision" },
  { label: "Mission", href: "/#mission", section: "mission" },
  { label: "Journals", href: "/#journals", section: "journals" },
  { label: "Editorial", href: "/#editorial", section: "editorial" },
  { label: "Why UORA", href: "/#why-uora", section: "why-uora" },
  { label: "Gallery", href: "/gallery" },
  { label: "Archives", href: "/archives" },
  { label: "Contact", href: "/#contact", section: "contact" },
];
