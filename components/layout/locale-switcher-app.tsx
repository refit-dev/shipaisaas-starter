"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { localeFlags, localeLabels, locales, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Used on auth + protected dashboard pages where locale lives in a cookie,
// NOT in the URL. Switching locale sets the NEXT_LOCALE cookie and reloads.
export function LocaleSwitcherApp() {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale() as Locale;

  function handleLocaleChange(newLocale: Locale) {
    if (newLocale === locale) return;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <Globe className="size-4" />
          <span className="sr-only">{t("label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={loc === locale ? "bg-muted font-medium" : ""}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeLabels[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
