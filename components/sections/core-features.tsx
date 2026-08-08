"use client";

import {
  BookOpenText,
  CreditCard,
  Database,
  Fingerprint,
  Globe,
  Lock,
  Mail,
  MoonStar,
  Receipt,
  ShieldHalf,
  Users,
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
    { title: "Authentication", description: "Secure login, registration, and magic links powered by Auth.js.", icon: Fingerprint },
    { title: "Stripe Billing", description: "Flexible subscription plans with automatic webhook syncing.", icon: CreditCard },
    { title: "Customer Portal", description: "Self-serve billing management, plan upgrades, and invoices.", icon: Receipt },
    { title: "Team Workspaces", description: "Invite members, manage roles, and share resources seamlessly.", icon: Users },
    { title: "Admin Dashboard", description: "High-level overview of users, revenue, and system health.", icon: ShieldHalf },
    { title: "Dark Mode", description: "Native light, dark, and system theme support out of the box.", icon: MoonStar },
    { title: "MDX Blog", description: "SEO-optimized, markdown-powered blog to drive organic traffic.", icon: BookOpenText },
    { title: "Email Templates", description: "Beautifully styled, responsive transactional emails via Resend.", icon: Mail },
    { title: "Database ORM", description: "Type-safe database interactions configured with Prisma or Drizzle.", icon: Database },
    { title: "Rate Limiting", description: "Built-in endpoint protection to prevent abuse and manage load.", icon: Lock },
    { title: "Edge Ready", description: "Optimized for Vercel Edge functions for lightning-fast responses.", icon: Zap },
    { title: "i18n Support", description: "Full locale support with EN, FR, DE, and ES out of the box. Add more languages with a single JSON file.", icon: Globe },
  ];

  const COLS = 4;

  return (
    <section className="bg-background py-20 sm:py-28">
      <MaxWidthWrapper>
        <AnimatedContainer className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="text-primary mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]">Everything included</p>
          <h2 className="text-foreground text-3xl font-extralight tracking-tight text-balance md:text-4xl lg:text-5xl">Everything you need to ship.</h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed text-balance md:text-base">The foundational features of every great SaaS are already built-in, so you can spend your time focusing on your unique agent logic.</p>
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
