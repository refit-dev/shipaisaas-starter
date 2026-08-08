import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";

/**
 * Three faces, each with one job:
 *
 * - `fontSans` (Geist) — everything: UI, body copy, buttons, dashboard.
 * - `fontDisplay` (Instrument Serif) — marketing headlines only. A light
 *   serif keeps the landing page from reading as purely geometric, which is
 *   what a grotesque plus dashed grids tends to do.
 * - `fontMono` (JetBrains Mono) — eyebrow labels, code and numeric detail.
 *
 * Use `font-display` sparingly. If a heading appears inside the product
 * rather than on a marketing page, it stays sans.
 */

export const fontSans = GeistSans;

export const fontDisplay = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
