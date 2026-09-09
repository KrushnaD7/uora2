import { useEffect, useState } from "react";

/**
 * Runs an async loader once on mount and reports its state.
 *
 * Ported pages were Next server components that did `const res = await load()`
 * at the top. In the SPA that fetch has to happen in the browser, so this hook
 * reproduces the same shape with a `loading` flag -- letting each page keep its
 * original JSX untouched.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: unknown[] = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loader()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
