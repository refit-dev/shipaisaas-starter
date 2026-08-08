"use client";

import { motion, useReducedMotion } from "motion/react";

import { duration, ease, staggerDelay, viewport } from "@/config/motion";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { GridPattern, genRandomPattern } from "@/components/ui/grid-feature-cards";

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    { number: "01", title: "Clone", description: "Clone the repo, run npm install, and copy .env.example to .env." },
    { number: "02", title: "Configure", description: "Drop in your Postgres URL and your OpenAI, Resend and Stripe keys, then run the migrations." },
    { number: "03", title: "Ship", description: "Edit the system prompt, add your own task templates, and deploy to Vercel." },
  ];

  return (
    <section className="bg-background py-16 sm:py-20">
      <MaxWidthWrapper>
        <div className="flex flex-col gap-10 sm:gap-16">

          {/* Header */}
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: duration.base, ease }}
          >
            <h2 className="text-foreground font-display text-2xl tracking-tight text-balance md:text-3xl lg:text-4xl">From clone to deployed in three steps.</h2>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 border border-border md:grid-cols-3">
            {steps.map((step, i) => {
              const p = genRandomPattern(parseInt(step.number, 10) * 7 + 13);
              return (
                <motion.div
                  key={step.number}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ duration: duration.base, delay: staggerDelay(i), ease }}
                  className={`group relative overflow-hidden border-border p-8 transition-colors duration-300 hover:bg-primary/[0.03] ${
                    i < steps.length - 1 ? "md:border-r" : ""
                  }`}
                >
                  {/* Pattern overlay */}
                  <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                    <div className="from-foreground/5 to-foreground/1 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-20 transition-opacity duration-300 group-hover:opacity-60">
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

                  <div className="relative z-10 mb-6 inline-flex h-12 w-12 items-center justify-center border border-border bg-background">
                    <span className="text-foreground/60 font-mono text-sm font-light tracking-widest">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-foreground relative z-10 mb-2 text-base font-medium">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground relative z-10 text-sm font-light leading-relaxed">
                    {step.description}
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
