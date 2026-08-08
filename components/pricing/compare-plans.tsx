"use client";

import { Check, Info } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { PlansRow } from "@/types";
import { comparePlans, plansColumns } from "@/config/subscriptions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { duration, ease, stagger, viewport } from "@/config/motion";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Highlight } from "@/components/shared/ornaments";

function renderCell(value: string | boolean | null) {
  if (value === null || value === false) {
    return <span className="text-muted-foreground/40 font-light">—</span>;
  }
  if (value === true) {
    return <Check className="text-primary mx-auto size-4 shrink-0" strokeWidth={2.5} />;
  }
  return <span className="text-foreground text-sm font-medium">{value}</span>;
}

export function ComparePlans() {
  const shouldReduceMotion = useReducedMotion();

  type TranslatedFeature = {
    name: string;
    tooltip?: string;
    free?: string;
    pro?: string;
    business?: string;
    enterprise?: string;
  };
  const translatedFeatures = [
  {
    "name": "Access to Analytics",
    "tooltip": "All plans include basic analytics for tracking performance.",
    "enterprise": "Custom"
  },
  {
    "name": "Custom Branding",
    "tooltip": "Custom branding is available from the Pro plan onwards.",
    "pro": "500/mo",
    "business": "1,500/mo",
    "enterprise": "Unlimited"
  },
  {
    "name": "Priority Support",
    "pro": "Email",
    "business": "Email & Chat",
    "enterprise": "24/7 Support"
  },
  {
    "name": "Advanced Reporting",
    "tooltip": "Advanced reporting is available in Business and Enterprise plans.",
    "enterprise": "Custom"
  },
  {
    "name": "Dedicated Manager",
    "tooltip": "Enterprise plan includes a dedicated account manager."
  },
  {
    "name": "API Access",
    "free": "Limited",
    "pro": "Standard",
    "business": "Enhanced",
    "enterprise": "Full"
  },
  {
    "name": "Monthly Webinars",
    "tooltip": "Pro and higher plans include access to monthly webinars.",
    "enterprise": "Custom"
  },
  {
    "name": "Custom Integrations",
    "tooltip": "Custom integrations are available in Business and Enterprise plans.",
    "business": "Available",
    "enterprise": "Available"
  },
  {
    "name": "Roles and Permissions",
    "tooltip": "User roles and permissions management improves with higher plans.",
    "pro": "Basic",
    "business": "Advanced",
    "enterprise": "Advanced"
  },
  {
    "name": "Onboarding Assistance",
    "tooltip": "Higher plans include more comprehensive onboarding assistance.",
    "pro": "Self-service",
    "business": "Assisted",
    "enterprise": "Full Service"
  }
] as TranslatedFeature[];

  const translatedRows = comparePlans.map((row, i) => {
    const tf = translatedFeatures[i];
    if (!tf) return row;
    const merged = { ...row };
    merged.feature = tf.name ?? row.feature;
    if (tf.tooltip !== undefined) merged.tooltip = tf.tooltip;
    for (const col of plansColumns) {
      if (tf[col] !== undefined) {
        (merged as any)[col] = tf[col];
      }
    }
    return merged as PlansRow;
  });

  return (
    <MaxWidthWrapper>
      {/* Header */}
      <motion.div
        className="mx-auto mb-14 max-w-2xl text-center"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: duration.base, ease }}
      >
        <p className="text-primary mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">Plans</p>
        <h2 className="text-foreground font-display text-3xl font-extrabold tracking-[-0.03em] text-balance md:text-5xl lg:text-6xl">
          <Highlight>Compare</Highlight> our plans
        </h2>
        <p className="text-muted-foreground mt-4 text-base font-light leading-relaxed text-balance">Find the perfect plan tailored for your business needs!</p>
      </motion.div>

      {/* Table */}
      <motion.div
        className="overflow-hidden border border-border"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: duration.base, delay: stagger.step * 2, ease }}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="sticky left-0 z-20 w-40 bg-muted/20 p-5 md:w-1/4">
                  <span className="sr-only">Features</span>
                </th>
                {plansColumns.map((col) => (
                  <th
                    key={col}
                    className={`border-l border-border p-5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] ${
                      col === "pro" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {translatedRows.map((row: PlansRow, i: number) => (
                <motion.tr
                  key={i}
                  className="group border-b border-border transition-colors duration-200 hover:bg-muted/30"
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={viewport}
                  transition={{ delay: 0.2 + i * 0.03, duration: 0.4 }}
                >
                  {/* Sticky feature name */}
                  <td className="bg-card group-hover:bg-muted/30 sticky left-0 z-10 border-r border-border transition-colors md:bg-transparent md:group-hover:bg-transparent">
                    <div className="flex items-center gap-2 py-4 pr-4 pl-5">
                      <span className="text-foreground text-sm font-medium leading-snug">
                        {row.feature}
                      </span>
                      {row.tooltip && (
                        <Popover>
                          <PopoverTrigger className="hover:bg-muted/60 shrink-0 rounded-full p-0.5 transition-colors">
                            <Info className="text-muted-foreground/50 hover:text-muted-foreground size-3.5" />
                          </PopoverTrigger>
                          <PopoverContent side="top" className="max-w-72 p-3 text-sm">
                            {row.tooltip}
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </td>

                  {/* Plan values */}
                  {plansColumns.map((col) => (
                    <td
                      key={col}
                      className="border-l border-border p-5 text-center text-sm"
                    >
                      {renderCell(row[col])}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </MaxWidthWrapper>
  );
}
