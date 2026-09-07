import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
  tone?: "light" | "dark";
  /** Hides the wordmark below the `sm` breakpoint when space is tight. */
  compact?: boolean;
}

export default function Brand({
  className,
  tone = "light",
  compact = false,
}: BrandProps) {
  const dark = tone === "dark";

  return (
    <Link
      href="/"
      aria-label="UORA Publications — home"
      className={cn("group flex items-center gap-3", className)}
    >
      <span
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-xl",
          "transition-transform duration-300 ease-out group-hover:scale-[1.04]",
          // The mark carries its own dark navy; it needs a light ground on both tones
          dark ? "bg-white ring-1 ring-white/25" : "bg-white ring-1 ring-line"
        )}
      >
        <Image
          src="/images/uora-mark.png"
          alt=""
          width={192}
          height={192}
          priority
          className="size-7 object-contain"
        />
      </span>

      <span className={cn("leading-none", compact && "hidden sm:block")}>
        <span
          className={cn(
            "block text-[19px] font-bold tracking-[-0.01em]",
            dark ? "text-white" : "text-navy-950"
          )}
        >
          UORA
        </span>
        <span
          className={cn(
            "mt-1 block text-[9.5px] font-semibold uppercase tracking-[0.3em]",
            dark ? "text-accent-300" : "text-ink-500"
          )}
        >
          Publications
        </span>
      </span>
    </Link>
  );
}
