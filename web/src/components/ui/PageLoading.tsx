import PublicLayout from "@/components/layout/PublicLayout";

/**
 * Loading state for pages that fetch in the browser.
 *
 * These were Next server components that rendered only after their data
 * resolved. In the SPA the fetch happens client-side, so this stands in while
 * it's in flight -- same spinner markup the old app/*\/loading.tsx files used.
 */
export function PageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent" />
        <p className="text-sm text-ink-500">{label}</p>
      </div>
    </div>
  );
}

/** Spinner wrapped in the public chrome, so the header/footer don't flash in. */
export default function PageLoading({ label }: { label?: string }) {
  return (
    <PublicLayout>
      <PageSpinner label={label} />
    </PublicLayout>
  );
}
