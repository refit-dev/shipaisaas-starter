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
import { motion, useReducedMotion } from "motion/react";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { FeatureCard } from "@/components/ui/grid-feature-cards";

type AnimatedContainerProps = {
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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

  const COLS = 4;

  return (
    <section className="bg-background py-20 sm:py-28">
      <MaxWidthWrapper>
        <AnimatedContainer className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="text-primary mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]">Everything included</p>
          <h2 className="text-foreground text-3xl font-extralight tracking-tight text-balance md:text-4xl lg:text-5xl">Everything you need to ship.</h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed text-balance md:text-base">Auth, billing, database and a working AI layer are already wired together, so you start on your product instead of the plumbing.</p>
        </AnimatedContainer>

        <div className="overflow-hidden border border-dashed border-border">
          {Array.from({ length: Math.ceil(coreFeatures.length / COLS) }, (_, rowIndex) => (
            <AnimatedContainer
              key={rowIndex}
              delay={0.1}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {coreFeatures.slice(rowIndex * COLS, rowIndex * COLS + COLS).map((feature, i) => (
                <FeatureCard
                  key={i}
                  feature={feature}
                  className="border-r border-b border-dashed border-border"
                />
              ))}
            </AnimatedContainer>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
