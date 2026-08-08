import "@/styles/globals.css";

import { fontDisplay, fontMono, fontSans } from "@/assets/fonts";
import { Analytics } from "@vercel/analytics/next";

import { constructMetadata } from "@/lib/utils";
import { Providers } from "@/components/providers";

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} bg-background min-h-screen font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
