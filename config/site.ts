import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "Ship AI SaaS Starter",
  description:
    "The open source AI SaaS starter. Next.js 16, Drizzle, Postgres, Better-Auth, Stripe, Resend, shadcn/ui and the Vercel AI SDK, wired together and ready to ship.",
  url: site_url,
  ogImage: `${site_url}/_static/og.png`,
  links: {
    twitter: "https://twitter.com/JeanChrinot",
    github: "https://github.com/jeanchrinot/shipaisaas-starter",
  },
  mailSupport: "support@shipaisaas.com",
};

export const footerLinks: SidebarNavItem[] = [
  {
    title: "Company",
    items: [
      { title: "About", href: "#" },
      { title: "Enterprise", href: "#" },
      { title: "Terms", href: "/terms" },
      { title: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "Product",
    items: [
      { title: "Getting started", href: "/help/getting-started" },
      { title: "Chat", href: "/help/using-the-chat" },
      { title: "Upgrade to Pro", href: "https://shipaisaas.com" },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Help centre", href: "/help" },
      { title: "Blog", href: "/blog" },
      { title: "Changelog", href: "/changelog" },
      { title: "Pricing", href: "/pricing" },
      { title: "GitHub", href: "https://github.com/jeanchrinot/shipaisaas-starter" },
    ],
  },
];
