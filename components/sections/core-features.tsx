"use client";

import {
  BookOpenText,
  Bot,
  Braces,
  CreditCard,
  Database,
  Fingerprint,
  Lock,
  Mail,
  MoonStar,
  Receipt,
  ShieldHalf,
  Zap,
} from "lucide-react";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Reveal } from "@/components/shared/reveal";
import { FeatureCard } from "@/components/ui/grid-feature-cards";

export default function CoreFeatures() {

  const coreFeatures = [
    { title: "Authentication", description: "Email/password and Google OAuth with sessions, verification and password reset, powered by Better-Auth.", icon: Fingerprint },
    { title: "Stripe Billing", description: "Three subscription tiers wired to Checkout and webhooks, with plan state stored in your database.", icon: CreditCard },
    { title: "Customer Portal", description: "Self-serve billing management, plan upgrades and invoices, straight from Stripe.", icon: Receipt },
    { title: "AI Chat", description: "Streaming chat on the Vercel AI SDK with persisted history and a model picker.", icon: Bot },
    { title: "Structured Output", description: "One-shot task templates that return validated JSON against a Zod schema.", icon: Braces },
    { title: "Usage Limits", description: "Per-plan daily and monthly request caps enforced server-side before a token is spent.", icon: Lock },
    { title: "Admin Dashboard", description: "Overview of users, workspaces and usage across your whole app.", icon: ShieldHalf },
    { title: "Database ORM", description: "Drizzle ORM on Postgres with typed schemas and a CLI migration workflow.", icon: Database },
    { title: "Email", description: "Transactional email through Resend for verification and account flows.", icon: Mail },
    { title: "MDX Blog & Docs", description: "Contentlayer-powered blog and help centre so your marketing site ships with the app.", icon: BookOpenText },
    { title: "Dark Mode", description: "Light, dark and system themes built on CSS variables and shadcn/ui.", icon: MoonStar },
    { title: "MIT Licensed", description: "Fork it, sell what you build with it, no strings attached.", icon: Zap },
  ];

  return (
    <section className="bg-background py-20 sm:py-28">
      <MaxWidthWrapper>
        <Reveal className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="text-primary mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]">Everything included</p>
          <h2 className="text-foreground text-3xl font-extralight tracking-tight text-balance md:text-4xl lg:text-5xl">Everything you need to ship.</h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed text-balance md:text-base">Auth, billing, database and a working AI layer are already wired together, so you start on your product instead of the plumbing.</p>
        </Reveal>

        <Reveal>
          <div className="border-border grid grid-cols-1 overflow-hidden border sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {coreFeatures.map((feature) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                className="border-border border-r border-b"
              />
            ))}
          </div>
        </Reveal>
      </MaxWidthWrapper>
    </section>
  );
}
