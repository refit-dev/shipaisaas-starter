"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAssistantStore } from "@/stores/assistantStore";
import { useUserStore } from "@/stores/userStore";
import { NavItem, SidebarNavItem } from "@/types";
import {
  Building2,
  Check,
  ChevronsUpDown,
  Crown,
  Globe,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelRightClose,
  Plus,
  Settings,
  Sun,
  SunMoon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { useLocale, useTranslations } from "next-intl";

import { localeFlags, localeLabels, locales, type Locale } from "@/i18n/config";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icons } from "@/components/shared/icons";
import { UserAvatar } from "@/components/shared/user-avatar";

import Logo from "./logo";
import { LocaleSwitcherApp } from "./locale-switcher-app";

interface DashboardSidebarProps {
  links: SidebarNavItem[];
  role: string | undefined | null;
}

// Workspace label — the OSS starter is single-workspace.
function OrganizationSwitcher({ expanded }: { expanded: boolean }) {
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();

  if (isPending) {
    return (
      <div className={cn("px-4 py-2", !expanded && "px-2")}>
        <div className="bg-muted h-10 w-full animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className={cn("px-4 py-2", !expanded && "flex justify-center px-2")}>
      <div
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-md",
          !expanded ? "w-10 justify-center p-0" : "px-3",
        )}
      >
        <div className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-sm">
          <Building2 className="size-4" />
        </div>
        {expanded && (
          <span className="truncate text-sm font-medium">
            {activeOrg?.name || "Workspace"}
          </span>
        )}
      </div>
    </div>
  );
}

function SidebarFooter({ expanded }: { expanded: boolean }) {
  const t = useTranslations("sidebar.user");
  const tTheme = useTranslations("theme");
  const currentLocale = useLocale() as Locale;
  const { data: session } = authClient.useSession();

  function handleLocaleChange(newLocale: Locale) {
    if (newLocale === currentLocale) return;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }
  const user = session?.user;
  const { userSubscriptionPlan, resetUserStore } = useUserStore();
  const { resetAssistantStore } = useAssistantStore();
  const { setTheme, theme } = useTheme();

  async function handleSignOut() {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Clear any client-side state related to the user or assistants
            resetUserStore();
            resetAssistantStore();
            window.location.href = "/login";
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  if (!user) return null;

  const isPaid = userSubscriptionPlan?.isPaid;
  const isCanceled = userSubscriptionPlan?.isCanceled;
  const planTitle = userSubscriptionPlan?.title;
  const periodEnd = userSubscriptionPlan?.stripeCurrentPeriodEnd;

  const formattedDate = periodEnd
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(periodEnd))
    : null;

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : SunMoon;

  if (!expanded) {
    return (
      <div className="flex flex-col items-center gap-1 border-t px-2 py-3">
        <LocaleSwitcherApp />
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9">
                  <ThemeIcon className="size-4" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 size-4" /> {tTheme("light")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 size-4" /> {tTheme("dark")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <SunMoon className="mr-2 size-4" /> {tTheme("system")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent side="right">Theme</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9">
                  <UserAvatar
                    user={{
                      name: user.name,
                      image: user.image || null,
                    }}
                    className="size-6"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                <div className="flex flex-col px-2 py-1.5">
                  {user.name && (
                    <p className="text-sm font-medium">{user.name}</p>
                  )}
                  {user.email && (
                    <p className="text-muted-foreground w-[180px] truncate text-xs">
                      {user.email}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Lock className="size-4" /> Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2"
                  >
                    <Settings className="size-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={handleSignOut}
                >
                  <LogOut className="mr-2 size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent side="right">{user.name || "Account"}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="border-t p-3">
      {/* Upgrade nudge — only for free users */}
      {user.role === "user" && userSubscriptionPlan && !isPaid && (
        <Link
          href="/dashboard/billing"
          className="bg-card/50 hover:bg-card mb-2 flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors"
        >
          <Crown className="text-muted-foreground size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-none font-medium">{t("upgradeTitle")}</p>
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
              {t("upgradeSubtitle")}
            </p>
          </div>
        </Link>
      )}

      {/* Paid plan status */}
      {user.role === "user" && isPaid && (
        <Link
          href="/dashboard/billing"
          className="bg-card/90 hover:bg-card mb-2 flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors"
        >
          <Crown className="size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-none font-medium">{t("planTitle", { title: planTitle ?? "" })}</p>
            {formattedDate && (
              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                {isCanceled
                  ? t("cancelsOn", { date: formattedDate })
                  : t("renewsOn", { date: formattedDate })}
              </p>
            )}
          </div>
        </Link>
      )}

      {/* User row */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="hover:bg-muted flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors">
            <UserAvatar
              user={{ name: user.name, image: user.image || null }}
              className="size-7 shrink-0"
            />
            <div className="min-w-0 flex-1">
              {user.name && (
                <p className="truncate text-sm leading-none font-medium">
                  {user.name}
                </p>
              )}
              {user.email && (
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  {user.email}
                </p>
              )}
            </div>
            <ThemeIcon className="text-muted-foreground size-3.5 shrink-0" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="start" className="w-56">
          <div className="flex flex-col px-2 py-1.5">
            {user.name && <p className="text-sm font-medium">{user.name}</p>}
            {user.email && (
              <p className="text-muted-foreground w-[180px] truncate text-xs">
                {user.email}
              </p>
            )}
          </div>
          <DropdownMenuSeparator />

          {user.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <Lock className="size-4" /> Admin
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="size-4" /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2"
            >
              <Settings className="size-4" /> Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2">
              <Globe className="size-4" />
              <span>{localeLabels[currentLocale]}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {locales.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className="flex items-center gap-2"
                >
                  <span>{localeFlags[loc]}</span>
                  <span>{localeLabels[loc]}</span>
                  {loc === currentLocale && (
                    <Check className="ml-auto size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <div className="flex items-center justify-around px-1 py-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={theme === "light" ? "secondary" : "ghost"}
                  size="icon"
                  className="size-8"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="size-4" />
                  <span className="sr-only">Light</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Light</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={theme === "dark" ? "secondary" : "ghost"}
                  size="icon"
                  className="size-8"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="size-4" />
                  <span className="sr-only">Dark</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dark</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={theme === "system" ? "secondary" : "ghost"}
                  size="icon"
                  className="size-8"
                  onClick={() => setTheme("system")}
                >
                  <SunMoon className="size-4" />
                  <span className="sr-only">System</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>System</TooltipContent>
            </Tooltip>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
            <LogOut className="mr-2 size-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function DashboardSidebar({ links, role }: DashboardSidebarProps) {
  const tSections = useTranslations("sidebar.sections");
  const tLinks = useTranslations("sidebar.links");
  const path = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        document.documentElement.style.setProperty(
          "--sidebar-width",
          `${entry.contentRect.width}px`,
        );
      }
    });
    observer.observe(sidebar);
    return () => observer.disconnect();
  }, []);

  const { isTablet } = useMediaQuery();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(!isTablet);

  useEffect(() => {
    setIsSidebarExpanded(!isTablet);
  }, [isTablet]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="bg-sidebar sticky top-0 h-full" ref={sidebarRef}>
        <aside
          className={cn(
            isSidebarExpanded ? "w-[220px] xl:w-[260px]" : "w-[68px]",
            "hidden h-screen flex-col border-r md:flex",
          )}
        >
          {/* Header */}
          <div className="flex h-14 shrink-0 items-center p-4 lg:h-[60px]">
            {isSidebarExpanded ? <Logo /> : null}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-9 lg:size-8"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              {isSidebarExpanded ? (
                <PanelLeftClose size={18} className="stroke-muted-foreground" />
              ) : (
                <PanelRightClose
                  size={18}
                  className="stroke-muted-foreground"
                />
              )}
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </div>

          {/* 2. Insert Organization Switcher Here */}
          {role && role === "user" && (
            <OrganizationSwitcher expanded={isSidebarExpanded} />
          )}

          {/* Scrollable nav — grows to fill space */}
          <ScrollArea className="min-h-0 flex-1">
            <nav className="flex flex-col gap-8 px-4 pt-4 pb-2">
              {links.map((section) => {
                if (section.items.length === 0) return null;
                return (
                  <section
                    key={section.title}
                    className="flex flex-col gap-0.5"
                  >
                    {isSidebarExpanded ? (
                      <p className="text-sidebar-foreground text-xs">
                        {tSections(section.title as any)}
                      </p>
                    ) : (
                      <div className="h-4" />
                    )}
                    {section.items.map((item) => {
                      const Icon = Icons[item.icon || "arrowRight"];
                      const label = tLinks(item.title as any);
                      return (
                        item.href && (
                          <Fragment key={`link-fragment-${item.title}`}>
                            {isSidebarExpanded ? (
                              <Link
                                href={item.disabled ? "#" : item.href}
                                className={cn(
                                  "hover:bg-primary/90 hover:text-sidebar-foreground flex items-center gap-3 rounded-md p-2 text-sm font-medium",
                                  path === item.href
                                    ? "bg-primary/90 text-primary-foreground hover:text-primary-foreground"
                                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                                  item.disabled &&
                                    "hover:text-muted-foreground cursor-not-allowed opacity-80 hover:bg-transparent",
                                )}
                              >
                                <Icon className="size-5" />
                                {label}
                                {item.badge && (
                                  <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            ) : (
                              <Tooltip key={`tooltip-${item.title}`}>
                                <TooltipTrigger asChild>
                                  <Link
                                    href={item.disabled ? "#" : item.href}
                                    className={cn(
                                      "hover:bg-muted flex items-center gap-3 rounded-md py-2 text-sm font-medium",
                                      path === item.href
                                        ? "bg-muted"
                                        : "text-muted-foreground hover:text-accent-foreground",
                                      item.disabled &&
                                        "hover:text-muted-foreground cursor-not-allowed opacity-80 hover:bg-transparent",
                                    )}
                                  >
                                    <span className="flex size-full items-center justify-center">
                                      <Icon className="size-5" />
                                    </span>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  {label}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </Fragment>
                        )
                      );
                    })}
                  </section>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Static footer — never scrolls */}
          <div className="shrink-0">
            <SidebarFooter expanded={isSidebarExpanded} />
          </div>
        </aside>
      </div>
    </TooltipProvider>
  );
}

export function MobileSheetSidebar({ links, role }: DashboardSidebarProps) {
  const tSections = useTranslations("sidebar.sections");
  const tLinks = useTranslations("sidebar.links");
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { isSm, isMobile } = useMediaQuery();

  if (isSm || isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-9 shrink-0 md:hidden"
            >
              <Menu className="size-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <ScrollArea className="min-h-0 flex-1">
              <nav className="flex flex-col gap-y-8 p-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Logo />
                </Link>

                {/* OrganizationSwitcher */}
                {role && role === "user" && (
                  <div className="-mx-4">
                    <OrganizationSwitcher expanded={true} />
                  </div>
                )}

                {links.map((section) => (
                  <section
                    key={section.title}
                    className="flex flex-col gap-0.5"
                  >
                    <p className="text-muted-foreground text-xs">
                      {tSections(section.title as any)}
                    </p>
                    {section.items.map((item) => {
                      const Icon = Icons[item.icon || "arrowRight"];
                      const label = tLinks(item.title as any);
                      return (
                        item.href && (
                          <Fragment key={`link-fragment-${item.title}`}>
                            <Link
                              onClick={() => {
                                if (!item.disabled) setOpen(false);
                              }}
                              href={item.disabled ? "#" : item.href}
                              className={cn(
                                "hover:bg-primary/90 hover:text-sidebar-foreground flex items-center gap-3 rounded-md p-2 text-sm font-medium",
                                path === item.href
                                  ? "bg-primary/90 text-primary-foreground hover:text-primary-foreground"
                                  : "text-muted-foreground hover:text-accent-foreground",
                                item.disabled &&
                                  "hover:text-muted-foreground cursor-not-allowed opacity-80 hover:bg-transparent",
                              )}
                            >
                              <Icon className="size-5" />
                              {label}
                              {item.badge && (
                                <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </Fragment>
                        )
                      );
                    })}
                  </section>
                ))}
              </nav>
            </ScrollArea>

            {/* Static footer in mobile sheet too */}
            <div className="shrink-0">
              <SidebarFooter expanded={true} />
            </div>
          </SheetContent>
        </Sheet>
      </TooltipProvider>
    );
  }

  return (
    <div className="bg-muted flex size-9 animate-pulse rounded-lg md:hidden" />
  );
}
