/**
 * `next/dynamic` compatibility shim.
 *
 * Mirrors the small subset of the Next API this app used so ported pages keep
 * their original code-splitting calls verbatim -- only the import path changed.
 * Backed by React.lazy + Suspense, with the same `loading` placeholder so the
 * layout doesn't shift while a chunk loads.
 */
import { lazy, Suspense } from "react";
import type { ComponentType, ReactNode } from "react";

type Loaded<P> = { default: ComponentType<P> } | ComponentType<P>;

interface DynamicOptions {
  loading?: () => ReactNode;
  /** Accepted and ignored: there is no server render in the SPA. */
  ssr?: boolean;
}

export default function dynamic<P extends object>(
  loader: () => Promise<Loaded<P>>,
  options: DynamicOptions = {}
): ComponentType<P> {
  const Lazy = lazy(async () => {
    const mod = await loader();
    return "default" in mod
      ? (mod as { default: ComponentType<P> })
      : { default: mod as ComponentType<P> };
  });

  const Loading = options.loading;

  return function DynamicComponent(props: P) {
    return (
      <Suspense fallback={Loading ? <Loading /> : null}>
        <Lazy {...(props as P & JSX.IntrinsicAttributes)} />
      </Suspense>
    );
  };
}
