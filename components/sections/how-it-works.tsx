"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { GridPattern, genRandomPattern } from "@/components/ui/grid-feature-cards";

export default function HowItWorks() {
  const t = useTranslations("marketing.howItWorks");
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    { number: "01", title: t("step1Title"), description: t("step1Desc") },
    { number: "02", title: t("step2Title"), description: t("step2Desc") },
    { number: "03", title: t("step3Title"), description: t("step3Desc") },
  ];

  return (
    <section className="bg-background py-24 sm:py-32">
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
            <p className="text-primary mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
              {t("title")}
            </p>
            <h2 className="text-foreground text-3xl font-extralight tracking-tight text-balance md:text-4xl lg:text-5xl">
              {t("subtitle")}
            </h2>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 border border-dashed border-border md:grid-cols-3">
            {steps.map((step, i) => {
              const p = genRandomPattern(parseInt(step.number, 10) * 7 + 13);
              return (
                <motion.div
                  key={step.number}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className={`group relative overflow-hidden border-dashed border-border p-8 transition-colors duration-300 hover:bg-primary/[0.03] ${
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

                  <div className="relative z-10 mb-6 inline-flex h-12 w-12 items-center justify-center border border-dashed border-border bg-background">
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
