"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function Faq() {
  const shouldReduceMotion = useReducedMotion();

  const faqItems = [
    { id: "security", question: "Is my data secure?", answer: "All data is encrypted at rest and in transit using AES-256 and TLS 1.3. We do not train on your data. Our infrastructure is hosted on SOC 2 Type II-compliant cloud providers, and we are currently pursuing our own SOC 2 certification." },
    { id: "onboarding", question: "How long does onboarding take?", answer: "Most teams are fully up and running in under 30 minutes. Our guided setup walks you through connecting your first data source, configuring your initial agents, and running your first automated workflow — no engineering resources required." },
    { id: "integrations", question: "What tools and integrations do you support?", answer: "We support REST API and webhook-based integrations out of the box, which means we connect to virtually any modern SaaS tool. Native connectors are available for the most popular platforms, with new integrations added regularly based on customer demand." },
    { id: "cancel", question: "Can I cancel anytime?", answer: "Yes, there is no lock-in. You can cancel your subscription at any time from your billing settings. Your data remains accessible and exportable for 30 days after cancellation, giving you full control of your information." },
    { id: "trial", question: "Do you offer a free trial?", answer: "Yes — every account starts with a 14-day free trial with full access to all features, no credit card required. At the end of your trial, you can choose the plan that fits your team's needs or continue on the free tier." },
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
            <p className="text-primary mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]">FAQ</p>
            <h2 className="text-foreground text-3xl font-extralight tracking-tight text-balance md:text-4xl lg:text-5xl">Common questions, straight answers.</h2>
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
