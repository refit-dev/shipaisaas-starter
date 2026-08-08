"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { AssetsMockUI } from "./mock-ui/assets-mock-ui";
import { HumanInLoopMockUI } from "./mock-ui/human-in-loop-mock-ui";
import { WorkflowsMockUI } from "./mock-ui/workflows-mock-ui";

export default function FeatureDeepDive() {
  const t = useTranslations("marketing.featureDeepDive");
  const shouldReduceMotion = useReducedMotion();

  const features = [
    {
      badge: t("badge1"),
      title: t("title1"),
      desc: t("desc1"),
      bullets: [t("bullet1a"), t("bullet1b"), t("bullet1c")],
      MockUI: WorkflowsMockUI,
      flip: false,
    },
    {
      badge: t("badge2"),
      title: t("title2"),
      desc: t("desc2"),
      bullets: [t("bullet2a"), t("bullet2b"), t("bullet2c")],
      MockUI: HumanInLoopMockUI,
      flip: true,
    },
    {
      badge: t("badge3"),
      title: t("title3"),
      desc: t("desc3"),
      bullets: [t("bullet3a"), t("bullet3b"), t("bullet3c")],
      MockUI: AssetsMockUI,
      flip: false,
    },
  ];

  return (
    <section className="bg-muted/20 overflow-x-hidden py-24 sm:py-32 border-y border-dashed border-border">
      <MaxWidthWrapper>
        <div className="flex flex-col gap-24 sm:gap-32">
          {features.map(({ badge, title, desc, bullets, MockUI, flip }) => (
            <div key={title} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Text side */}
              <motion.div
                className={`flex flex-col justify-center space-y-6 ${flip ? "lg:order-last" : ""}`}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <p className="text-primary text-[11px] font-semibold uppercase tracking-[0.2em]">
                  {badge}
                </p>
                <h2 className="text-foreground text-3xl font-extralight tracking-tight sm:text-4xl">
                  {title}
                </h2>
                <div className="h-px w-12 bg-primary/40" />
                <p className="text-muted-foreground text-base font-light leading-relaxed">
                  {desc}
                </p>
                <ul className="space-y-3 pt-2">
                  {bullets.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check className="text-primary size-4 shrink-0" strokeWidth={2.5} />
                      <span className="text-foreground text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Mock UI side */}
              <motion.div
                className="overflow-hidden"
                initial={shouldReduceMotion ? false : { opacity: 0, x: flip ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <MockUI />
              </motion.div>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
