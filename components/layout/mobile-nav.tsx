"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { docsConfig } from "@/config/docs";
import { marketingConfig } from "@/config/marketing";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { DocsSidebarNav } from "@/components/docs/sidebar-nav";
import { SlidingButton } from "@/components/shared/sliding-button";

import Logo from "./logo";
import { LocaleSwitcherApp } from "./locale-switcher-app";
import { LocaleSwitcherMarketing } from "./locale-switcher-marketing";
import { ModeToggle } from "./mode-toggle";

interface NavMobileProps {
  localeSwitcherVariant?: "marketing" | "app";
}

const ARROW_CLASS =
  "size-4 flex-shrink-0 opacity-35 transition-all duration-200 group-hover:opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5";

function NavItem({
  href,
  label,
  external,
  disabled,
  onClick,
}: {
  href: string;
  label: string;
  external?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <li className="border-b border-border/40">
      <Link
        href={disabled ? "#" : href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={onClick}
        className={cn(
          "group flex w-full items-center justify-between py-4 text-base font-medium transition-colors text-muted-foreground hover:text-foreground",
          disabled && "pointer-events-none opacity-40",
        )}
      >
        {label}
        <ArrowUpRight className={ARROW_CLASS} />
      </Link>
    </li>
  );
}

export function NavMobile({ localeSwitcherVariant = "marketing" }: NavMobileProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [open, setOpen] = useState(false);
  const selectedLayout = useSelectedLayoutSegment();
  const documentation = selectedLayout === "docs";

  const configMap = { docs: docsConfig.mainNav };
  const links =
    (selectedLayout && configMap[selectedLayout as keyof typeof configMap]) ||
    marketingConfig.mainNav;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  const ctaHref = user
    ? user.role === "admin" || user.role === "superadmin"
      ? "/admin"
      : "/dashboard"
    : "/login";
  const ctaLabel = user ? "Dashboard" : "Sign In";

  return (
    <>
      {/* Fixed top-right controls */}
      <div className="fixed top-3 right-3 z-[60] flex items-center gap-1 md:hidden">
        <ModeToggle />
        <div className="h-4 w-px mx-1 bg-foreground/20" />
        {localeSwitcherVariant === "app" ? (
          <LocaleSwitcherApp />
        ) : (
          <LocaleSwitcherMarketing />
        )}
        <div className="h-4 w-px mx-1 bg-foreground/20" />
        <button
          onClick={() => setOpen(!open)}
          className="rounded-full p-2 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus:outline-none"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Full-screen overlay */}
      <nav
        className={cn(
          "fixed inset-0 z-50 flex flex-col w-full overflow-auto bg-background transition-all duration-300 md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Subtle grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <pattern id="mobile-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="var(--hero-grid-base)"
                strokeWidth="0.5"
                strokeDasharray="2 4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mobile-grid)" />
        </svg>

        {/* Top bar — Logo */}
        <div className="relative z-10 flex items-center px-5 pt-3 pb-4 border-b border-border">
          <Logo />
        </div>

        {/* Nav links */}
        <ul className="relative z-10 flex-1 px-5 pt-2">
          {links &&
            links.length > 0 &&
            links.map(({ title, href, disabled, external }: any) => (
              <NavItem
                key={href}
                href={href}
                label={title}
                external={external}
                disabled={disabled}
                onClick={() => setOpen(false)}
              />
            ))}

          {user ? (
            <>
              {(user.role === "admin" || user.role === "superadmin") && (
                <NavItem href="/admin" label="Admin" onClick={() => setOpen(false)} />
              )}
              <NavItem href="/dashboard" label="Dashboard" onClick={() => setOpen(false)} />
            </>
          ) : null}
        </ul>

        {/* CTA */}
        <div className="relative z-10 px-5 py-8 flex justify-center">
          <SlidingButton href={ctaHref} label={ctaLabel} size="md" />
        </div>

        {documentation && (
          <div className="relative z-10 px-5 pb-8 md:hidden">
            <DocsSidebarNav setOpen={setOpen} />
          </div>
        )}
      </nav>
    </>
  );
}
