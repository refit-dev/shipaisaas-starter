import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const { withContentlayer } = require("next-contentlayer2");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Locale-prefixed redirects (marketing/docs routes)
      { source: "/:locale/docs", destination: "/:locale/help", permanent: true },
      { source: "/:locale/docs/:path*", destination: "/:locale/help", permanent: true },
      { source: "/:locale/guides", destination: "/:locale/help", permanent: true },
      { source: "/:locale/guides/:path*", destination: "/:locale/help", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

// withNextIntl wraps withContentlayer wraps nextConfig
module.exports = withNextIntl(withContentlayer(nextConfig));
