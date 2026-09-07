"use client";

import { memo, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Mail, Phone, X } from "lucide-react";

import Brand from "./Brand";
import { navItems } from "./navData";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  activeSection: string | null;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

const MobileNav = memo(function MobileNav({
  open,
  onClose,
  activeSection,
}: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();

  // Mirror the desktop navbar: only authors are sent to the submission form.
  const submitHref =
    !loading && isAuthenticated && user?.role === "AUTHOR"
      ? "/dashboard/submissions/new"
      : "/login";

  // Lock the page behind the drawer without losing scroll position.
  useEffect(() => {
    if (!open) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open]);

  // Move focus into the drawer, trap it there, and hand it back on close.
  useEffect(() => {
    if (!open) {
      restoreFocusTo.current?.focus();
      return;
    }

    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div className="lg:hidden">
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-60 bg-navy-950/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        inert={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-70 flex w-[min(23rem,92vw)] flex-col bg-white shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-line px-5">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex size-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 hover:text-navy-900"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = item.section
                ? item.section === activeSection
                : pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-colors",
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-navy-900 hover:bg-ink-50"
                    )}
                  >
                    {item.label}
                    <ArrowRight
                      className={cn(
                        "size-4 transition-opacity",
                        active ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 space-y-3 border-t border-line pt-6">
            <Button href={submitHref} variant="primary" size="lg" block onClick={onClose}>
              Submit Manuscript
              <ArrowRight className="size-4" />
            </Button>
            <Button href="/login" variant="secondary" size="lg" block onClick={onClose}>
              Author Login
            </Button>
          </div>

          <div className="mt-8 space-y-3 border-t border-line pt-6 text-sm text-ink-600">
            <a
              href="mailto:contact@uorapublications.com"
              className="flex items-center gap-3 transition-colors hover:text-brand-700"
            >
              <Mail className="size-4 shrink-0 text-brand-600" />
              contact@uorapublications.com
            </a>
            <a
              href="tel:+919766930707"
              className="flex items-center gap-3 transition-colors hover:text-brand-700"
            >
              <Phone className="size-4 shrink-0 text-brand-600" />
              +91 97669 30707
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
});

export default MobileNav;