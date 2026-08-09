"use client";

import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/analytics";
import { TailwindIndicator } from "@/components/tailwind-indicator";

import { UserProvider } from "./user-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      themes={["light", "dark"]}
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
      <Analytics />
      <Toaster richColors closeButton />
      <TailwindIndicator />
      <UserProvider />
    </ThemeProvider>
  );
}
