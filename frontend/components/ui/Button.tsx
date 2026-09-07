import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const button = cva(
  [
    "group/btn relative inline-flex select-none items-center justify-center gap-2",
    "font-semibold whitespace-nowrap",
    "transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        /** Primary action — one per view. */
        primary: [
          "bg-brand-600 text-white shadow-brand",
          "hover:bg-brand-700 hover:shadow-lg",
        ],
        /** Equal-weight action on light surfaces. */
        secondary: [
          "border border-line bg-white text-navy-900 shadow-xs",
          "hover:border-navy-300 hover:bg-navy-50",
        ],
        /** High-contrast action, for use inside light panels. */
        contrast: [
          "bg-navy-900 text-white shadow-md",
          "hover:bg-navy-800 hover:shadow-lg",
        ],
        /** For dark surfaces (footer, CTA panel). */
        inverse: [
          "border border-white/15 bg-white/8 text-white backdrop-blur-sm",
          "hover:border-white/30 hover:bg-white/15",
        ],
        ghost: ["text-navy-800", "hover:bg-navy-50 hover:text-brand-700"],
      },
      size: {
        sm: "h-9 rounded-lg px-3.5 text-[13px]",
        md: "h-11 rounded-xl px-5 text-sm",
        lg: "h-13 rounded-xl px-6 text-[15px]",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonVariants = VariantProps<typeof button>;

type BaseProps = ButtonVariants & {
  className?: string;
  children: ReactNode;
};

type AnchorProps = BaseProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & {
    href: string;
  };

type NativeProps = BaseProps &
  Omit<ComponentProps<"button">, "className" | "children"> & {
    href?: never;
  };

export type ButtonProps = AnchorProps | NativeProps;

export default function Button(props: ButtonProps) {
  const { className, variant, size, block, children, ...rest } = props;
  const classes = cn(button({ variant, size, block }), className);

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkProps } = rest as AnchorProps;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as NativeProps;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
