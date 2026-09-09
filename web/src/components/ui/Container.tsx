import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Width = "narrow" | "default" | "wide";

const widths: Record<Width, string> = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** `default` (1152px) is the site's primary measure. */
  width?: Width;
  as?: ElementType;
}

export default function Container({
  children,
  className,
  width = "default",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        widths[width],
        className
      )}
    >
      {children}
    </Tag>
  );
}
