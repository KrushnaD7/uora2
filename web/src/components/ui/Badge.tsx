import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium",
  {
    variants: {
      tone: {
        neutral: "border-line bg-white text-ink-700",
        brand: "border-brand-200 bg-brand-50 text-brand-700",
        accent: "border-accent-200 bg-accent-50 text-accent-700",
        navy: "border-navy-200 bg-navy-50 text-navy-700",
        inverse: "border-white/15 bg-white/10 text-white/85",
      },
      size: {
        sm: "px-2.5 py-1 text-[11px]",
        md: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  }
);

interface BadgeProps extends VariantProps<typeof badge> {
  children: ReactNode;
  className?: string;
}

export default function Badge({ children, className, tone, size }: BadgeProps) {
  return <span className={cn(badge({ tone, size }), className)}>{children}</span>;
}
