import { useParams } from "@/lib/nav";
import { getJournalSubdomain } from "./subdomain";

/**
 * The journal a page should show.
 *
 * On the main site the slug comes from the URL (/journals/:slug/...). On a
 * journal subdomain there is no :slug segment, so it comes from the hostname
 * instead. Journal pages call this rather than reading the route param
 * directly, so they work in both places unchanged.
 */
export function useJournalSlug(): string {
  const { slug } = useParams<{ slug: string }>();
  return slug || getJournalSubdomain() || "";
}
