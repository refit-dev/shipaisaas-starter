"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

/**
 * Two-state theme switch — light or dark, no "system" middle ground.
 *
 * Both icons are always rendered and crossfade, so the button never changes
 * size and there is no layout shift on toggle. Before hydration `resolvedTheme`
 * is undefined; we render the moon (the default theme) so the markup matches
 * what the server sent.
 */
export function ModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-muted relative flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute size-[18px] transition-all duration-300",
          isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute size-[18px] transition-all duration-300",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}
