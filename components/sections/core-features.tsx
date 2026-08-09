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
  Scale,
  ShieldHalf,
} from "lucide-react";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { CurvedArrow, Highlight } from "@/components/shared/ornaments";
import { Reveal } from "@/components/shared/reveal";

const coreFeatures = [
  {
    title: "Authentication",
    description:
      "Email/password and Google OAuth with sessions, verification and password reset, powered by Better-Auth.",
    icon: Fingerprint,
  },
  {
    title: "Stripe Billing",
    description:
      "Three subscription tiers wired to Checkout and webhooks, with plan state stored in your database.",
    icon: CreditCard,
  },
  {
    title: "Customer Portal",
    description:
      "Self-serve billing management, plan upgrades and invoices, straight from Stripe.",
    icon: Receipt,
  },
  {
    title: "AI Chat",
    description:
      "Streaming chat on the Vercel AI SDK with persisted history and a model picker.",
    icon: Bot,
  },
  {
    title: "Structured Output",
    description:
      "One-shot task templates that return validated JSON against a Zod schema.",
    icon: Braces,
  },
  {
    title: "Usage Limits",
    description:
      "Per-plan daily and monthly request caps enforced server-side before a token is spent.",
    icon: Lock,
  },
  {
    title: "Admin Dashboard",
    description:
      "Overview of users, workspaces and usage across your whole app.",
    icon: ShieldHalf,
  },
  {
    title: "Database ORM",
    description:
      "Drizzle ORM on Postgres with typed schemas and a CLI migration workflow.",
    icon: Database,
  },
  {
    title: "Email",
    description:
      "Transactional email through Resend for verification and account flows.",
    icon: Mail,
  },
  {
    title: "MDX Blog & Docs",
    description:
      "Contentlayer-powered blog and help centre so your marketing site ships with the app.",
    icon: BookOpenText,
  },
  {
    title: "Dark Mode",
    description:
      "Light and dark themes built on CSS variables and shadcn/ui.",
    icon: MoonStar,
  },
  {
    title: "MIT Licensed",
    description: "Fork it, sell what you build with it, no strings attached.",
    icon: Scale,
  },
];

export default function CoreFeatures() {
  return (
    <section className="bg-muted/30 relative py-24 sm:py-28">
      <MaxWidthWrapper>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Sticky intro rail */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="text-primary mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">
                In the box
              </p>
              <h2 className="text-foreground font-display text-3xl font-extrabold tracking-[-0.03em] text-balance md:text-4xl">
                Twelve things you <Highlight>don&apos;t</Highlight> have to build.
              </h2>
              <p className="text-muted-foreground mt-5 text-base leading-relaxed">
                Every one of these is wired up and working on first run — not a
                stub, not a TODO.
              </p>
              <CurvedArrow className="text-primary/30 mt-8 hidden w-24 lg:block" />
            </div>
          </div>

          {/* Spec list — deliberately not cards */}
          <div className="lg:col-span-8">
            <ul className="grid grid-cols-1 sm:grid-cols-2">
              {coreFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <Reveal
                    key={feature.title}
                    index={i}
                    className="border-border border-t py-6 sm:odd:pr-8 sm:even:pl-8"
                  >
                    <li className="list-none">
                      <div className="flex items-start gap-3">
                        <Icon
                          className="text-primary mt-0.5 size-4 shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                        <div>
                          <h3 className="text-foreground text-sm font-semibold">
                            {feature.title}
                          </h3>
                          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
