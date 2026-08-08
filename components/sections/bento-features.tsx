"use client";

import { Bot, Braces, CreditCard, Gauge } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import {
  GridPattern,
  genRandomPattern,
  strToSeed,
} from "@/components/ui/grid-feature-cards";

export default function BentoFeatures() {
  const shouldReduceMotion = useReducedMotion();

  const features = [
    { icon: Bot,        title: "Streaming Chat",     description: "A chat UI on the Vercel AI SDK with persisted conversations, file attachments and a model picker across OpenAI and Anthropic.", wide: true  },
    { icon: Braces,     title: "Structured Output",   description: "Task templates that force the model to return JSON matching a Zod schema — validated before it ever reaches your UI.",           wide: false },
    { icon: CreditCard, title: "Subscriptions",       description: "Three Stripe tiers with Checkout, the customer portal and webhooks that keep plan state in your own database.",                  wide: false },
    { icon: Gauge,      title: "Usage Limits",        description: "Daily and monthly request caps per plan, enforced server-side before a single token is spent, with token counts recorded per team.", wide: true  },
  ];

  return (
    <section className="bg-muted/20 py-24 sm:py-32">
      <MaxWidthWrapper>
        <div className="flex flex-col gap-10 sm:gap-16">

          {/* Header */}
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-primary mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]">Features</p>
            <h2 className="text-foreground text-3xl font-extralight tracking-tight text-balance md:text-4xl lg:text-5xl">Everything a working AI product needs.</h2>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 border border-dashed border-border overflow-hidden">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const p = genRandomPattern(strToSeed(feature.title));
              // Row 1: i=0 (wide) | i=1 (normal) — Row 2: i=2 (normal) | i=3 (wide)
              const needsBottomBorder = i < 2;
              const needsRightBorder = i === 0 || i === 2;
              return (
                <motion.div
                  key={feature.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={cn(
                    "group relative overflow-hidden p-8 bg-background/30 transition-colors duration-300 hover:bg-primary/[0.03]",
                    feature.wide ? "md:col-span-2" : "md:col-span-1",
                    needsBottomBorder && "border-b border-dashed border-border",
                    needsRightBorder && "md:border-r md:border-dashed md:border-border",
                  )}
                >
                  {/* Pattern overlay */}
                  <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                    <div className="from-foreground/5 to-foreground/1 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-30 transition-opacity duration-300 group-hover:opacity-70">
                      <GridPattern
                        width={20}
                        height={20}
                        x="-12"
                        y="4"
                        squares={p}
                        className="fill-foreground/20 stroke-foreground/15 absolute inset-0 h-full w-full mix-blend-overlay"
                      />
                    </div>
                  </div>

                  <div className="bg-background border border-dashed border-border mb-5 inline-flex h-10 w-10 items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <Icon
                      className="text-foreground/75 h-5 w-5 transition-colors duration-300 group-hover:text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-medium">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </MaxWidthWrapper>
    </section>
  );
}
