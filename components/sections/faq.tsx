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
    { id: "license", question: "What can I build with this?", answer: "Anything. The starter is MIT licensed, so you can fork it, change it, and sell the product you build on top of it. There is no attribution requirement and no revenue share." },
    { id: "included", question: "What is actually included?", answer: "Next.js 16 with the App Router, Better-Auth (email/password plus Google), Drizzle ORM on Postgres, three Stripe subscription tiers with webhooks, Resend transactional email, a streaming chat layer on the Vercel AI SDK, structured-output task templates, per-plan usage limits, an admin area, and an MDX blog and help centre." },
    { id: "models", question: "Which AI models does it support?", answer: "OpenAI and Anthropic models are configured out of the box in lib/ai/models.ts, and the model picker in the chat input switches between them. Adding another provider supported by the Vercel AI SDK is a few lines in that same file." },
    { id: "setup", question: "How long does setup take?", answer: "Clone the repo, copy .env.example to .env, add your Postgres URL and API keys, run the migrations, and start the dev server. Most people are signed in to their own instance in about fifteen minutes." },
    { id: "premium", question: "How is this different from Ship AI SaaS Pro?", answer: "This starter covers the foundation: auth, database, billing, email and a direct AI layer. Pro adds the hard parts of agentic products — real-time tool-call state in the UI, human-in-the-loop approvals, background execution through a queue, token-level credit metering with pay-as-you-go top-ups, multi-tenant teams and RBAC, i18n, and a scaffolding CLI." },
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
