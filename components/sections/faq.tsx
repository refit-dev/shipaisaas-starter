"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function Faq() {
  const t = useTranslations("marketing.faq");
  const shouldReduceMotion = useReducedMotion();

  const faqItems = [
    { id: "security", question: t("securityQuestion"), answer: t("securityAnswer") },
    { id: "onboarding", question: t("onboardingQuestion"), answer: t("onboardingAnswer") },
    { id: "integrations", question: t("integrationsQuestion"), answer: t("integrationsAnswer") },
    { id: "cancel", question: t("cancelQuestion"), answer: t("cancelAnswer") },
    { id: "trial", question: t("trialQuestion"), answer: t("trialAnswer") },
  ];

  return (
    <section className="bg-background py-24 sm:py-32">
      <MaxWidthWrapper>
        <div className="mx-auto max-w-3xl">
          <motion.div
            className="mb-14 text-center"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-primary mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
              {t("label")}
            </p>
            <h2 className="text-foreground text-3xl font-extralight tracking-tight text-balance md:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
          </motion.div>

          <Accordion
            type="single"
            collapsible
            className="w-full border-t border-dashed border-border"
          >
            {faqItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <AccordionItem
                  value={item.id}
                  className="border-b border-dashed border-border"
                >
                  <AccordionTrigger className="text-foreground hover:text-foreground py-5 text-left text-[15px] font-medium hover:no-underline [&>svg]:text-muted-foreground [&>svg]:shrink-0">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 text-sm leading-relaxed sm:text-[15px]">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
