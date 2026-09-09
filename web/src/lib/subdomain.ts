/**
 * Per-journal subdomain detection.
 *
 * A journal has its own subdomain, e.g. ujhss.uorapublications.com, which
 * should show that journal's site. The whole SPA is served on every hostname,
 * so the app looks at the current hostname, and if it's a journal subdomain,
 * routes to that journal (see App.tsx). The subdomain label is matched against
 * the journal's `slug`.
 *
 * The root domain is configurable so the same logic works in development
 * (e.g. ujhss.localhost:5173). Anything that isn't a real journal subdomain --
 * the bare root, www, a reserved name, an IP, a preview host -- returns null,
 * and the app renders normally.
 */
const ROOT_DOMAIN = (
  (import.meta.env.VITE_ROOT_DOMAIN as string | undefined) || "uorapublications.com"
).toLowerCase();

const RESERVED = new Set([
  "www", "api", "mail", "webmail", "ftp", "cpanel", "smtp", "pop", "imap",
  "ns1", "ns2", "admin", "app", "cdn", "static", "assets",
]);

export function getJournalSubdomain(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname.toLowerCase();

  // Exact root or www -> not a journal subdomain.
  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) return null;

  // Must sit directly under the configured root (rules out IPs, previews,
  // and bare localhost).
  if (!host.endsWith(`.${ROOT_DOMAIN}`)) return null;

  const label = host.slice(0, host.length - ROOT_DOMAIN.length - 1);
  // One clean label only, and not a reserved service name.
  if (!label || label.includes(".") || RESERVED.has(label)) return null;

  return label;
}

/** True when the app is being viewed on a journal subdomain. */
export function isJournalSubdomain(): boolean {
  return getJournalSubdomain() !== null;
}

export { ROOT_DOMAIN };
