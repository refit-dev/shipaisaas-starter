"use client";

import { Braces, CreditCard, Gauge } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { duration, ease, staggerDelay, viewport } from "@/config/motion";
import { cn } from "@/lib/utils";
import { CodePanel, type CodeLine } from "@/components/shared/code-panel";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Highlight } from "@/components/shared/ornaments";

const CHAT_SNIPPET: CodeLine[] = [
  [{ text: "// app/api/chat/route.ts", tone: "comment" }],
  [],
  [
    { text: "const ", tone: "key" },
    { text: "result " },
    { text: "= ", tone: "key" },
    { text: "await ", tone: "key" },
    { text: "streamChat", tone: "fn" },
    { text: "({" },
  ],
  [{ text: "  messages," }],
  [{ text: "  conversationId," }],
  [{ text: "  modelId," }],
  [{ text: "});" }],
  [],
  [{ text: "// usage is recorded once the stream ends", tone: "comment" }],
  [
    { text: "await ", tone: "key" },
    { text: "updateUsage", tone: "fn" },
    { text: "({ teamId, totalTokens });" },
  ],
];

const SMALL_FEATURES = [
  {
    icon: Braces,
    title: "Structured output",
    description:
      "Task templates force the model to return JSON that matches a Zod schema — validated before it reaches your UI.",
    aurora: "var(--chart-3)",
  },
  {
    icon: CreditCard,
    title: "Subscriptions",
    description:
      "Three Stripe tiers with Checkout, the customer portal, and webhooks that keep plan state in your own database.",
    aurora: "var(--chart-5)",
  },
];

const STATS = [
  {
    value: "3 weeks",
    label: "Of auth, billing and AI plumbing you don't have to write",
    tone: "text-chart-1",
  },
  {
    value: "15 min",
    label: "From clone to a running app on your own keys",
    tone: "text-chart-3",
  },
  {
    value: "$0",
    label: "MIT licensed — no seat fees, no revenue share, ever",
    tone: "text-chart-5",
  },
];

/** Soft coloured wash bleeding in from one corner, as in a lit product shot. */
function Aurora({ color, className }: { color: string; className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        background: `radial-gradient(120% 90% at 0% 0%, color-mix(in oklab, ${color} 26%, transparent) 0%, transparent 62%)`,
      }}
      aria-hidden
    />
  );
}

export default function BentoFeatures() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-background py-24 sm:py-28">
      <MaxWidthWrapper>
        <div className="flex flex-col gap-12 sm:gap-14">
          <motion.div
            className="max-w-2xl"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: duration.base, ease }}
          >
            <p className="text-primary mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">
              Features
            </p>
            <h2 className="text-foreground font-display text-3xl font-extrabold tracking-[-0.03em] text-balance md:text-5xl">
              Everything a <Highlight>working</Highlight> AI product needs.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Lead cell: the code you actually get */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: duration.base, ease }}
              className="group bg-card hover:border-primary/40 relative overflow-hidden rounded-2xl border p-6 transition-colors duration-200 sm:p-8 lg:col-span-3 lg:row-span-2"
            >
              <Aurora color="var(--chart-1)" />
              <div className="relative">
                <h3 className="text-foreground text-xl font-semibold sm:text-2xl">
                  Streaming chat, one function call
                </h3>
                <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
                  Persisted conversations, file attachments and a model picker
                  across OpenAI and Anthropic. Rate limited before a single
                  token is spent.
                </p>
                <CodePanel
                  filename="route.ts"
                  lines={CHAT_SNIPPET}
                  className="mt-6"
                />
              </div>
            </motion.div>

            {/* Two supporting cells */}
            {SMALL_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{
                    duration: duration.base,
                    delay: staggerDelay(i + 1),
                    ease,
                  }}
                  className="group bg-card hover:border-primary/40 relative overflow-hidden rounded-2xl border p-6 transition-colors duration-200 sm:p-8 lg:col-span-2"
                >
                  <Aurora color={feature.aurora} />
                  <div className="bg-background/60 text-foreground relative mb-5 inline-flex size-11 items-center justify-center rounded-xl border backdrop-blur transition-transform duration-200 group-hover:scale-105">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-foreground relative mb-2 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground relative text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Stats — one card each, big and light, a hue apiece */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{
                  duration: duration.base,
                  delay: staggerDelay(i),
                  ease,
                }}
                className="bg-card relative overflow-hidden rounded-2xl border p-7 sm:p-8"
              >
                <p
                  className={cn(
                    "font-display text-4xl leading-none font-light tracking-[-0.02em] sm:text-5xl",
                    stat.tone,
                  )}
                >
                  {stat.value}
                </p>
                <p className="text-foreground/80 mt-5 text-sm leading-snug">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Usage limits — full-width, iconographic */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: duration.base, ease }}
            className="bg-card relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8"
          >
            <Aurora color="var(--chart-4)" />
            <div className="bg-background/60 text-foreground relative flex size-12 shrink-0 items-center justify-center rounded-xl border backdrop-blur">
              <Gauge className="size-6" strokeWidth={1.75} />
            </div>
            <div className="relative">
              <h3 className="text-foreground text-lg font-semibold">
                Usage limits that actually hold
              </h3>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                Daily and monthly request caps per plan, enforced server-side
                before the model is called, with token counts recorded per team
                so you know what a customer really costs.
              </p>
            </div>
          </motion.div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
