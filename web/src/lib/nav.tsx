/**
 * Next.js navigation compatibility layer.
 *
 * The frontend was ported from Next.js to a React Router SPA. Rather than edit
 * 40+ call sites (and risk changing markup/styling), this module re-implements
 * the small slice of the Next API the app actually used, backed by React
 * Router. Ported files only needed their import path swapped.
 */
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams as useRouterParams,
} from "react-router-dom";

type NextLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children?: ReactNode;
  /** Accepted and ignored -- Next-only props that must not reach the DOM. */
  prefetch?: boolean;
  scroll?: boolean;
  replace?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
};

/** True for targets React Router should not handle (external, mail, hash). */
function isExternal(href: string): boolean {
  return (
    /^([a-z][a-z0-9+.-]*:)?\/\//i.test(href) ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  );
}

/**
 * Drop-in for `next/link`: takes `href`, renders a router link for in-app
 * routes and a plain anchor for external/hash targets.
 */
export const Link = forwardRef<HTMLAnchorElement, NextLinkProps>(
  function Link(
    { href, children, prefetch, scroll, replace, shallow, passHref, legacyBehavior, ...rest },
    ref
  ) {
    if (!href || isExternal(href)) {
      return (
        <a ref={ref} href={href} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <RouterLink ref={ref} to={href} replace={replace} {...rest}>
        {children}
      </RouterLink>
    );
  }
);

export default Link;

/** Drop-in for `usePathname` from next/navigation. */
export function usePathname(): string {
  return useLocation().pathname;
}

/** Drop-in for `useSearchParams` (returns the standard URLSearchParams). */
export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

/** Drop-in for `useRouter` from next/navigation (app-router shape). */
export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    prefetch: () => {},
    refresh: () => navigate(0),
  };
}

/**
 * Route params. Next passed these to pages as a `params` prop; in the SPA they
 * come from the router, so ported pages read them with this hook instead.
 */
export function useParams<T extends Record<string, string | undefined>>(): T {
  return useRouterParams() as T;
}
