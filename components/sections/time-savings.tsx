"use client";

import { Check, Clock } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { duration, ease, stagger, viewport } from "@/config/motion";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const rows = [
  { feature: "Universal Agentic Chat & Routing",              buildTime: "4–6 weeks" },
  { feature: "Background Execution Queue (QStash)",           buildTime: "3–4 weeks" },
  { feature: "Human-in-the-Loop (HITL) Guardrails",          buildTime: "2–3 weeks" },
  { feature: "Asset Interceptor & Vault UI",                  buildTime: "2–3 weeks" },
  { feature: "Authentication (OAuth, Magic Links)",           buildTime: "1–2 weeks" },
  { feature: "Stripe Subscriptions & Webhooks",               buildTime: "2–3 weeks" },
  { feature: "Multi-tenant Organizations & Teams",            buildTime: "3–4 weeks" },
  { feature: "Admin Dashboard & ROI Analytics",               buildTime: "2–3 weeks" },
  { feature: "Dark Mode & Responsive Design System",          buildTime: "1–2 weeks" },
  { feature: "Security, Patches & Dependency Updates",        buildTime: "Ongoing"   },
];

const COL = "border-l border-border";
const CELL = "flex items-center p-5 sm:px-8";

export default function TimeSavings() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-background py-20 sm:py-28">
      <MaxWidthWrapper>
        {/* Header */}
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: duration.base, ease }}
        >
          <p className="text-primary mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">
            Save 300+ Hours
          </p>
          <h2 className="text-foreground font-display text-2xl tracking-tight text-balance md:text-3xl lg:text-4xl">
            Focus on your AI logic.
          </h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed text-balance md:text-base">
            Every row below is wired, tested, and connected to real data. Skip the plumbing and go straight to the part that makes you money.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          className="mx-auto max-w-4xl overflow-hidden border border-border"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: duration.base, delay: stagger.step * 2, ease }}
        >
          {/* Column headers */}
          <div className="grid grid-cols-3 border-b border-border bg-muted/20">
            <div className={CELL}>
              <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.18em]">
                Component
              </p>
            </div>
            <div className={`${COL} ${CELL}`}>
              <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.18em]">
                Build yourself
              </p>
            </div>
            <div className={`${COL} ${CELL}`}>
              <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em]">
                With boilerplate
              </p>
            </div>
          </div>

          {/* Data rows */}
          {rows.map((row, i) => (
            <motion.div
              key={i}
              className="group grid grid-cols-3 border-b border-border transition-colors duration-200 hover:bg-muted/30"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewport}
              transition={{ delay: 0.25 + i * 0.04, duration: 0.4 }}
            >
              <div className={CELL}>
                <span className="text-foreground text-sm font-medium">{row.feature}</span>
              </div>
              <div className={`${COL} ${CELL} gap-2`}>
                <Clock className="text-muted-foreground/50 size-3.5 shrink-0" />
                <span className="text-muted-foreground text-sm line-through">{row.buildTime}</span>
              </div>
              <div className={`${COL} ${CELL} gap-2`}>
                <Check className="text-primary size-3.5 shrink-0" strokeWidth={2.5} />
                <span className="text-foreground text-sm font-medium">
                  {row.buildTime === "Ongoing" ? "Included" : "Pre-built"}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Summary row */}
          <div className="grid grid-cols-3 bg-muted/30">
            <div className={CELL}>
              <p className="text-foreground text-sm font-semibold">Total Time to Launch</p>
            </div>
            <div className={`${COL} ${CELL}`}>
              <span className="text-muted-foreground text-base font-bold line-through">
                4–6 Months
              </span>
            </div>
            <div className={`${COL} ${CELL}`}>
              <span className="text-primary text-xl font-bold tracking-tight">
                This weekend.
              </span>
            </div>
          </div>
        </motion.div>
      </MaxWidthWrapper>
    </section>
  );
}
