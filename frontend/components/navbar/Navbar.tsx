"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";

import Brand from "./Brand";
import MobileNav from "./MobileNav";
import { navItems } from "./navData";
import { useActiveSection } from "./useActiveSection";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";

const Navbar = memo(function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();

  // The manuscript submission form is author-only. Anyone else — including
  // anonymous visitors and staff sessions — is sent to the login/register flow
  // instead of bouncing off the author route guard.
  const submitHref =
    !loading && isAuthenticated && user?.role === "AUTHOR"
      ? "/dashboard/submissions/new"
      : "/login";

  const sectionIds = useMemo(
    () => navItems.map((item) => item.section).filter(Boolean) as string[],
    []
  );
  const activeSection = useActiveSection(sectionIds);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 12));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const handleMenuOpen = useCallback(() => setMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      {/* Utility strip — a live editorial signal, collapsed once reading starts */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-50 overflow-hidden bg-navy-950 text-white",
          "transition-[height,opacity] duration-400 ease-out",
          scrolled ? "h-0 opacity-0" : "h-9 opacity-100"
        )}
        aria-hidden={scrolled}
      >
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
          <p className="flex min-w-0 items-center gap-2.5 text-[12.5px]">
            <span className="relative flex size-1.5 shrink-0">
              <span className="absolute inline-flex size-full animate-ping-slow rounded-full bg-accent-400" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent-400" />
            </span>
            {/* Kept to one line at every width — the bar has a fixed height */}
            <span className="truncate text-navy-100">
              <span className="hidden sm:inline">Call for Papers · </span>
              <span className="text-white">Volume 1, Issue 1</span> now open
              <span className="hidden sm:inline"> for submissions</span>
            </span>
          </p>

          <div className="hidden items-center gap-6 text-[12.5px] text-navy-200 md:flex">
            <span className="font-mono tracking-tight">
              DOI prefix 10.4589
            </span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <a
              href="mailto:contact@uorapublications.com"
              className="transition-colors hover:text-white"
            >
              contact@uorapublications.com
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "fixed inset-x-0 z-50 transition-[top,padding] duration-400 ease-out",
          scrolled ? "top-0 py-3" : "top-9 py-0"
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "flex items-center justify-between gap-6 transition-all duration-400 ease-out",
              scrolled
                ? "h-16 rounded-2xl border border-line/90 bg-white/85 px-4 shadow-lg backdrop-blur-xl sm:px-5"
                : "h-20 rounded-2xl border border-transparent bg-transparent px-1"
            )}
          >
            <Brand />

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-0.5">
                {navItems.map((item) => {
                  const active = item.section
                    ? item.section === activeSection
                    : pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "relative block rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors duration-200",
                          active
                            ? "text-brand-700"
                            : "text-ink-700 hover:text-navy-950"
                        )}
                      >
                        {item.label}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute inset-x-2.5 -bottom-0.5 h-0.5 origin-left rounded-full bg-brand-600 transition-transform duration-300 ease-out",
                            active ? "scale-x-100" : "scale-x-0"
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-[14px] font-medium text-ink-700 transition-colors hover:text-navy-950 xl:block"
              >
                Author Login
              </Link>

              <Button href={submitHref} size="md" className="hidden sm:inline-flex">
                Submit Manuscript
                <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
              </Button>

              <button
                type="button"
                onClick={handleMenuOpen}
                aria-label="Open navigation"
                aria-expanded={menuOpen}
                className="flex size-11 items-center justify-center rounded-xl border border-line bg-white text-navy-900 shadow-xs transition-colors hover:bg-ink-50 lg:hidden"
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        open={menuOpen}
        onClose={handleMenuClose}
        activeSection={activeSection}
      />
    </>
  );
});

export default Navbar;
