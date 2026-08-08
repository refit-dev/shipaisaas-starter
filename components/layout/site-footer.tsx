import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import Link from "next/link";
import { footerLinks, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/layout/mode-toggle";

import Logo from "./logo";

export async function SiteFooter({
  className,
}: React.HTMLAttributes<HTMLElement>) {

  return (
    <footer
      className={cn("relative border-t border-border", className)}
      style={{
        background: `linear-gradient(to bottom right, var(--hero-bg-from) 0%, var(--muted) 55%, var(--secondary) 100%)`,
      }}
    >
      {/* Grid pattern — uses currentColor so it works in both light and dark mode */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <pattern id="footer-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0L0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footer-grid)" />
      </svg>
      <div className="relative z-10 container mx-auto max-w-6xl px-4 md:px-6">

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-5 md:gap-8 lg:gap-16">

          {/* Brand column */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <Logo />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[260px]">
              {siteConfig.description}
            </p>
            <a
              href={`mailto:${siteConfig.mailSupport}`}
              className="group flex w-fit items-center gap-0.5 text-muted-foreground text-xs hover:text-foreground transition-colors duration-200"
            >
              {siteConfig.mailSupport}
              <ArrowUpRight className="size-3 opacity-30 transition-all duration-200 group-hover:opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Link columns */}
          <div className="col-span-1 grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-3 lg:pl-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <p className="text-muted-foreground mb-4 font-mono text-[10px] tracking-[0.18em] uppercase">
                  {section.title}
                </p>
                <ul className="space-y-3">
                  {section.items?.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href as any}
                        className="group flex items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {item.title}
                        <ArrowUpRight className="size-3 opacity-0 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 border-t border-border md:flex-row">
          <span className="text-muted-foreground text-xs">
            {`Copyright © ${new Date().getFullYear()} Ship AI SaaS. All rights reserved.`}
          </span>

          <div className="flex items-center gap-4">
            <a
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-0.5 text-muted-foreground text-xs hover:text-foreground transition-colors duration-200"
            >
              Twitter
              <ArrowUpRight className="size-3 opacity-30 transition-all duration-200 group-hover:opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-0.5 text-muted-foreground text-xs hover:text-foreground transition-colors duration-200"
            >
              GitHub
              <ArrowUpRight className="size-3 opacity-30 transition-all duration-200 group-hover:opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <ModeToggle />
          </div>
        </div>

      </div>
    </footer>
  );
}
