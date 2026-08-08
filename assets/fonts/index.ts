import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Three faces, each with one job:
 *
 * - `fontSans` (DM Sans) — body copy, UI, buttons, the whole dashboard.
 * - `fontDisplay` (Plus Jakarta Sans) — headlines. Heavy weights with tight
 *   tracking are what make a landing page feel confident rather than quiet.
 * - `fontMono` (JetBrains Mono) — eyebrow labels, code and numeric detail.
 */

export const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  // 300/400 carry the oversized stat numerals, 700/800 the headlines.
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
