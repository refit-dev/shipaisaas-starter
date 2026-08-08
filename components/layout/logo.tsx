import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Wordmark: the bolt in brand pink, "Ship" over "AISaaS".
 *
 * Rendered by the nav, the mobile menu and the footer — change it here and it
 * changes everywhere.
 */
export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2 select-none", className)}
      aria-label="Ship AI SaaS — home"
    >
      <svg
        width="13"
        height="22"
        viewBox="0 0 13 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary transition-transform duration-200 group-hover:-rotate-6"
        aria-hidden
      >
        <path
          d="M8 0 L1 12 L5.5 12 L4 22 L12 10 L7.5 10 Z"
          fill="currentColor"
        />
      </svg>

      <div className="flex flex-col leading-none">
        <span className="font-display text-foreground text-[17px] font-extrabold tracking-[-0.02em]">
          Ship
        </span>
        <span className="font-display mt-[3px] text-[10.5px] font-bold tracking-[0.06em]">
          <span className="text-foreground">AI</span>
          <span className="text-muted-foreground">SaaS</span>
        </span>
      </div>
    </Link>
  );
}
