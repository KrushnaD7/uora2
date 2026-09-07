import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_DASHBOARD: Record<string, string> = {
  ADMIN: "/admin",
  SUB_ADMIN: "/editor/dashboard",
  EDITOR: "/editor/dashboard",
  REVIEWER: "/reviewer/dashboard",
  AUTHOR: "/dashboard",
};

const PROTECTED_ROUTES: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/editor": ["ADMIN", "EDITOR", "SUB_ADMIN"],
  "/reviewer": ["REVIEWER"],
  "/dashboard": ["AUTHOR"],
};

// ---------------------------------------------------------------------------
// Per-journal subdomains
//
// A journal's own subdomain (e.g. jar.uorapublications.com) should behave
// like its own independent journal website, reusing the exact same
// "/journals/[slug]/..." pages that already power that journal's section of
// the main site -- just rewritten so the visitor never sees "/journals/jar"
// in the URL. Everything that's genuinely platform-wide (login, dashboards,
// the cross-journal directory, legal pages, static assets, the API) is left
// alone and keeps working identically on every subdomain.
//
// Set ROOT_DOMAIN in the environment to your real domain (e.g.
// "uorapublications.com") -- a plain server-side env var, not NEXT_PUBLIC_,
// since this file only ever runs on the server/edge, so it can be changed
// without a rebuild. Any host that isn't the root domain, "www", or a
// reserved name below is treated as a journal subdomain -- matched against
// the journal's "subdomain" field, which today is always kept identical to
// its "slug" by the admin "Add Journal" form, so the subdomain value doubles
// as the slug for routing purposes.
// ---------------------------------------------------------------------------

const ROOT_DOMAIN = (
  process.env.ROOT_DOMAIN || "uorapublications.com"
).toLowerCase();

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "mail",
  "webmail",
  "cpanel",
  "ftp",
  "ns1",
  "ns2",
]);

// Left as-is (never rewritten) no matter which subdomain the request came
// in on: auth, role dashboards, the cross-journal directory (its own links
// are already fully-qualified "/journals/<slug>/..." paths so they need no
// rewriting), legal/policy pages, static assets and the API.
const GLOBAL_PATH_PREFIXES = [
  "/api",
  "/_next",
  "/admin",
  "/editor",
  "/reviewer",
  "/dashboard",
  "/login",
  "/register",
  "/apply",
  "/journals",
  "/articles",
  "/peer-review",
  "/gallery",
  "/privacy-policy",
  "/terms-and-conditions",
  "/favicon.ico",
];

function getJournalSubdomain(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0].toLowerCase();

  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return null;
  }
  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    // Doesn't match the configured root domain at all (localhost during
    // development, a raw IP, a preview URL, etc.) -- never rewrite.
    return null;
  }

  const sub = hostname.slice(0, hostname.length - ROOT_DOMAIN.length - 1);
  if (!sub || sub.includes(".") || RESERVED_SUBDOMAINS.has(sub)) return null;

  return sub;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function matchProtectedRoute(
  pathname: string
): { path: string; roles: string[] } | null {
  const sorted = Object.keys(PROTECTED_ROUTES).sort(
    (a, b) => b.length - a.length
  );
  for (const path of sorted) {
    if (pathname === path || pathname.startsWith(path + "/")) {
      return { path, roles: PROTECTED_ROUTES[path] };
    }
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1. Journal subdomain rewrite -------------------------------------
  const subdomain = getJournalSubdomain(request.headers.get("host"));

  if (subdomain) {
    const isGlobalPath = GLOBAL_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );

    if (!isGlobalPath) {
      const url = request.nextUrl.clone();
      url.pathname = `/journals/${subdomain}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // --- 2. Role-based route protection (unchanged) ------------------------
  const match = matchProtectedRoute(pathname);
  if (!match) return NextResponse.next();

  const token = request.cookies.get("session-token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session-token");
    return response;
  }

  const userRole = payload.role as string | undefined;
  if (!userRole || !match.roles.includes(userRole)) {
    const correctDashboard = (userRole && ROLE_DASHBOARD[userRole]) || "/login";
    return NextResponse.redirect(new URL(correctDashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
