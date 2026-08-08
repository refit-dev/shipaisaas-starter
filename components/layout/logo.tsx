"use client";

import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 select-none">
      <svg
        width="13"
        height="22"
        viewBox="0 0 13 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d="M8 0 L1 12 L5.5 12 L4 22 L12 10 L7.5 10 Z" fill="currentColor" />
      </svg>

      <div className="flex flex-col leading-none">
        <span className="text-[17px] font-bold tracking-tight text-foreground">
          Ship
        </span>
        <span className="mt-[3px] text-[10.5px] font-semibold tracking-[0.06em]">
          <span className="text-foreground">AI</span>
          <span className="text-foreground/55">SaaS</span>
        </span>
      </div>
    </Link>
  );
}
