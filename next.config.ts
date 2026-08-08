import type { NextConfig } from "next";

const { withContentlayer } = require("next-contentlayer2");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/docs", destination: "/help", permanent: true },
      { source: "/docs/:path*", destination: "/help", permanent: true },
      { source: "/guides", destination: "/help", permanent: true },
      { source: "/guides/:path*", destination: "/help", permanent: true },
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

module.exports = withContentlayer(nextConfig);
