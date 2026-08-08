"use client";

import { motion, useReducedMotion } from "motion/react";

import { duration, ease, staggerDelay, viewport } from "@/config/motion";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Highlight } from "@/components/shared/ornaments";

const steps = [
  {
    number: "01",
    title: "Clone",
    description:
      "Pull the repo, install, and copy the example environment file.",
    command: "npx degit jeanchrinot/shipaisaas-starter my-app && npm install",
  },
  {
    number: "02",
    title: "Configure",
    description:
      "Add your Postgres URL and your OpenAI, Resend and Stripe keys, then create the schema.",
    command: "cp .env.example .env && npm run db:migrate",
  },
  {
    number: "03",
    title: "Ship",
    description:
      "Edit the system prompt, add your own task templates, and deploy.",
    command: "npm run dev  →  vercel deploy",
  },
];

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-background py-20 sm:py-24">
      <MaxWidthWrapper>
        <motion.div
          className="mb-14 max-w-2xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: duration.base, ease }}
        >
          <p className="text-primary mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">
            How it works
          </p>
          <h2 className="text-foreground font-display text-3xl font-extrabold tracking-[-0.03em] text-balance md:text-5xl">
            From clone to deployed in <Highlight>three steps</Highlight>.
          </h2>
        </motion.div>

        {/* Timeline — the line does the work, no boxes needed */}
        <div className="relative">
          <div
            className="bg-border absolute top-2 bottom-2 left-[19px] w-px sm:left-[23px]"
            aria-hidden
          />

          <ol className="flex flex-col gap-10 sm:gap-12">
            {steps.map((step, i) => (
              <motion.li
                key={step.number}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{
                  duration: duration.base,
                  delay: staggerDelay(i),
                  ease,
                }}
                className="relative flex gap-6 sm:gap-8"
              >
                <div className="bg-primary text-primary-foreground relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold sm:size-12 sm:text-sm">
                  {step.number}
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <h3 className="text-foreground text-xl font-semibold sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-base">
                    {step.description}
                  </p>

                  <div className="border-border bg-card mt-4 flex items-center gap-3 overflow-x-auto rounded-xl border px-4 py-3">
                    <span className="text-primary shrink-0 font-mono text-sm select-none">
                      $
                    </span>
                    <code className="text-foreground/85 font-mono text-xs whitespace-nowrap sm:text-[13px]">
                      {step.command}
                    </code>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
