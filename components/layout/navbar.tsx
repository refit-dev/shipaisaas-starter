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
import { Skeleton } from "@/components/ui/skeleton";
import { DocsSearch } from "@/components/docs/search";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { SlidingButton } from "@/components/shared/sliding-button";

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
        className="flex h-14 items-center justify-between py-4"
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
                    "group flex items-center gap-0.5 text-sm font-medium transition-colors",
                    item.href.startsWith(`/${selectedLayout}`)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                    item.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {item.title}
                  <ArrowUpRight className="size-3 opacity-35 transition-all duration-200 group-hover:opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center space-x-3">
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

          {!mounted || isPending ? (
            <Skeleton className="hidden h-9 w-28 rounded-full md:flex" />
          ) : (
            <div className="hidden md:block">
              <SlidingButton
                href={
                  user
                    ? user.role === "admin" || user.role === "superadmin"
                      ? "/admin"
                      : "/dashboard"
                    : "/login"
                }
                label={user ? "Dashboard" : "Sign In"}
                size="sm"
              />
            </div>
          )}

          <div className="hidden items-center gap-2 md:flex">
            <ModeToggle />
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
}
