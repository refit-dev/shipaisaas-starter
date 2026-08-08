"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { duration, ease, staggerDelay, viewport } from "@/config/motion";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Highlight } from "@/components/shared/ornaments";

export default function Faq() {
  const shouldReduceMotion = useReducedMotion();

  const faqItems = [
    { id: "license", question: "What can I build with this?", answer: "Anything. The starter is MIT licensed, so you can fork it, change it, and sell the product you build on top of it. There is no attribution requirement and no revenue share." },
    { id: "included", question: "What is actually included?", answer: "Next.js 16 with the App Router, Better-Auth (email/password plus Google), Drizzle ORM on Postgres, three Stripe subscription tiers with webhooks, Resend transactional email, a streaming chat layer on the Vercel AI SDK, structured-output task templates, per-plan usage limits, an admin area, and an MDX blog and help centre." },
    { id: "models", question: "Which AI models does it support?", answer: "OpenAI and Anthropic models are configured out of the box in lib/ai/models.ts, and the model picker in the chat input switches between them. Adding another provider supported by the Vercel AI SDK is a few lines in that same file." },
    { id: "setup", question: "How long does setup take?", answer: "Clone the repo, copy .env.example to .env, add your Postgres URL and API keys, run the migrations, and start the dev server. Most people are signed in to their own instance in about fifteen minutes." },
    { id: "premium", question: "How is this different from Ship AI SaaS Pro?", answer: "This starter covers the foundation: auth, database, billing, email and a direct AI layer. Pro adds the hard parts of agentic products — real-time tool-call state in the UI, human-in-the-loop approvals, background execution through a queue, token-level credit metering with pay-as-you-go top-ups, multi-tenant teams and RBAC, i18n, and a scaffolding CLI." },
  ];

  return (
    <section className="bg-background py-16 sm:py-24">
      <MaxWidthWrapper>
        <div className="mx-auto max-w-3xl">
          <motion.div
            className="mb-14 text-center"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: duration.base, ease }}
          >
            <p className="text-primary mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">FAQ</p>
            <h2 className="text-foreground font-display text-3xl font-extrabold tracking-[-0.03em] text-balance md:text-5xl lg:text-6xl">
              Common questions, <Highlight>straight</Highlight> answers.
            </h2>
          </motion.div>

          <Accordion
            type="single"
            collapsible
            className="w-full border-t border-border"
          >
            {faqItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={viewport}
                transition={{ duration: duration.base, delay: staggerDelay(i), ease }}
              >
                <AccordionItem
                  value={item.id}
                  className="border-b border-border"
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
