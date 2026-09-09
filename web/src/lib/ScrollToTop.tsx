import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Next.js scrolled to the top on every navigation; React Router preserves the
 * scroll position instead. This restores the old behaviour so page transitions
 * feel identical to the previous site.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
