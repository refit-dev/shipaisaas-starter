import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type CtaButtonProps = {
  href: string;
  label: string;
  size?: "sm" | "default" | "lg";
  /** Outline treatment for the secondary action next to a primary one. */
  variant?: "primary" | "outline";
  external?: boolean;
  className?: string;
};

/**
 * The canonical call to action: a solid brand pill with a trailing arrow.
 *
 * The hero's "Start for $0" is the reference — every other primary button on
 * the site renders through here so they cannot drift apart.
 */
export function CtaButton({
  href,
  label,
  size = "default",
  variant = "primary",
  external,
  className,
}: CtaButtonProps) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={cn(
        buttonVariants({
          variant: variant === "outline" ? "outline" : "default",
          size,
          rounded: "full",
        }),
        "group font-semibold",
        className,
      )}
    >
      {label}
      <ArrowRight
        className={cn(
          "ml-1 transition-transform duration-200 group-hover:translate-x-0.5",
          size === "sm" ? "size-3.5" : "size-4",
        )}
      />
    </Link>
  );
}
