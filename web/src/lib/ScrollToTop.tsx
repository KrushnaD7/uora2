import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Restores the browser-like scrolling that Next.js gave us for free.
 *
 * React Router keeps the previous scroll position on navigation and does not
 * act on a URL hash, so two behaviours have to be reproduced:
 *
 *  - `/#about` (the whole main nav) must scroll to that section. Those
 *    sections are lazily loaded, so the target often does not exist on the
 *    first frame -- we retry briefly instead of giving up.
 *  - any other navigation starts at the top of the page.
 *
 * The navbar offset is handled by `scroll-padding-top` in globals.css, which
 * scrollIntoView honours, so anchors don't land underneath the header.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    // Sections near the bottom of the home page are code-split, so arriving
    // from another route the target can take a while to mount. Keep looking
    // for a few seconds rather than giving up after a beat.
    const RETRY_INTERVAL_MS = 50;
    const MAX_ATTEMPTS = 100; // ~5s
    let attempts = 0;
    let timer: number | undefined;

    // Poll briefly: the section may still be code-splitting in.
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        const before = window.scrollY;
        // Honours the CSS scroll-behavior (smooth) and scroll-padding-top.
        el.scrollIntoView({ block: "start" });

        // Guard: smooth scrolling is a no-op in some environments, which
        // would leave the anchor silently ignored. If nothing moved, place
        // the page directly -- matching what scroll-padding-top would give.
        timer = window.setTimeout(() => {
          if (Math.abs(window.scrollY - before) < 2) {
            const padding = parseFloat(
              getComputedStyle(document.documentElement).scrollPaddingTop
            );
            const top =
              el.getBoundingClientRect().top +
              window.scrollY -
              (Number.isFinite(padding) ? padding : 0);
            window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
          }
        }, 400);
        return;
      }
      if (attempts++ < MAX_ATTEMPTS) {
        timer = window.setTimeout(tryScroll, RETRY_INTERVAL_MS);
      }
    };
    tryScroll();

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [pathname, hash]);

  return null;
}
