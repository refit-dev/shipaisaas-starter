import * as React from "react";
import Link from "next/link";
import { Github } from "lucide-react";

import { footerLinks, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { CtaButton } from "@/components/shared/cta-button";
import { Icons } from "@/components/shared/icons";

import Logo from "./logo";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer
      className={cn("border-border relative border-t", className)}
      style={{
        background:
          "radial-gradient(80% 120% at 50% 0%, var(--hero-glow) 0%, transparent 60%)",
      }}
    >
      <div className="relative z-10 container mx-auto max-w-6xl px-4 md:px-6">
        {/* Sign-off band */}
        <div className="border-border flex flex-col items-start justify-between gap-6 border-b py-14 md:flex-row md:items-center">
          <div>
            <p className="font-display text-foreground text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
              Start building today.
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Clone it, add your keys, ship something.
            </p>
          </div>
          <CtaButton
            href={siteConfig.links.github}
            label="Star on GitHub"
            external
            className="shrink-0"
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 py-14 md:grid-cols-5 md:gap-8 lg:gap-16">
          {/* Brand column */}
          <div className="flex flex-col gap-5 md:col-span-2">
            <Logo />
            <p className="text-muted-foreground max-w-[280px] text-sm leading-relaxed">
              {siteConfig.description}
            </p>
            <a
              href={`mailto:${siteConfig.mailSupport}`}
              className="text-muted-foreground hover:text-foreground w-fit text-sm transition-colors duration-200"
            >
              {siteConfig.mailSupport}
            </a>
          </div>

          {/* Link columns */}
          <div className="col-span-1 grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-3 lg:pl-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <p className="text-foreground mb-4 text-sm font-semibold">
                  {section.title}
                </p>
                <ul className="space-y-3">
                  {section.items?.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href as any}
                        className="text-muted-foreground hover:text-primary text-sm transition-colors duration-200"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border flex flex-col items-center justify-between gap-4 border-t py-7 md:flex-row">
          <span className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Ship AI SaaS. MIT licensed.
          </span>

          <div className="flex items-center gap-2">
            <a
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="border-border text-muted-foreground hover:border-primary/50 hover:text-foreground flex size-9 items-center justify-center rounded-full border transition-colors duration-200"
            >
              <Icons.x className="size-3.5" />
            </a>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="border-border text-muted-foreground hover:border-primary/50 hover:text-foreground flex size-9 items-center justify-center rounded-full border transition-colors duration-200"
            >
              <Github className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
