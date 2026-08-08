import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "@/styles/globals.css";

import { fontMono, fontSans, fontSerif } from "@/assets/fonts";
import { Analytics } from "@vercel/analytics/next";

import { constructMetadata } from "@/lib/utils";
import { Providers } from "@/components/providers";

export const metadata = constructMetadata();

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Locale is read from the NEXT_LOCALE cookie via i18n/request.ts.
  // No locale segment in the URL — /login, /dashboard, /admin all live here.
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} bg-background min-h-screen font-sans antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
