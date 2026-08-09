"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";

import { docsConfig } from "@/config/docs";
import { marketingConfig } from "@/config/marketing";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CtaButton } from "@/components/shared/cta-button";
import { DocsSearch } from "@/components/docs/search";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";

interface NavBarProps {
  scroll?: boolean;
  large?: boolean;
}

export function NavBar({ scroll = false }: NavBarProps) {
  const scrolled = useScroll(50);
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const selectedLayout = useSelectedLayoutSegment();
  const documentation = selectedLayout === "docs";

  const isHome = /^\/(en|fr|de|es)?$/.test(pathname);
  const isTransparent = isHome && !scrolled;

  const configMap = {
    docs: docsConfig.mainNav,
  };

  const links =
    (selectedLayout && (configMap as any)[selectedLayout]) ||
    marketingConfig.mainNav;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex w-full justify-center transition-all duration-300",
        isTransparent
          ? "border-transparent bg-transparent"
          : "border-b border-border bg-background/80 backdrop-blur-xl",
      )}
    >
      <MaxWidthWrapper
        className="flex h-16 items-center justify-between py-4"
        large={documentation}
      >
        <div className="flex gap-6 md:gap-10">
          <Logo />

          {links && links.length > 0 ? (
            <nav className="hidden gap-6 md:flex">
              {links.map((item: any, index: number) => (
                <Link
                  key={index}
                  href={item.disabled ? "#" : item.href}
                  prefetch={true}
                  className={cn(
                    "group flex items-center gap-0.5 text-[15px] font-semibold transition-colors",
                    item.href.startsWith(`/${selectedLayout}`)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                    item.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {item.title}
                  <ArrowUpRight className="size-3 opacity-35 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-70" />
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {/* right header for docs */}
          {documentation ? (
            <div className="hidden flex-1 items-center space-x-4 sm:justify-end lg:flex">
              <div className="hidden lg:flex lg:grow-0">
                <DocsSearch />
              </div>
              <div className="flex lg:hidden">
                <Icons.search className="text-muted-foreground size-6" />
              </div>
            </div>
          ) : null}

          {/* Below md the toggle lives in the mobile nav's fixed control
              cluster, beside the menu button — rendering it here too would
              stack it under that button. */}
          <ModeToggle className="hidden md:flex" />

          {!mounted || isPending ? (
            <Skeleton className="hidden h-9 w-40 rounded-full md:flex" />
          ) : user ? (
            <CtaButton
              href={
                user.role === "admin" || user.role === "superadmin"
                  ? "/admin"
                  : "/dashboard"
              }
              label="Dashboard"
              size="sm"
              className="hidden md:inline-flex"
            />
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  rounded: "full",
                  className: "font-semibold",
                })}
              >
                Log in
              </Link>
              <CtaButton href="/signup" label="Start for $0" size="sm" />
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    </header>
  );
}
