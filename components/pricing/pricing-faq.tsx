"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { HeaderSection } from "../shared/header-section";
import MaxWidthWrapper from "../shared/max-width-wrapper";

const pricingFaqData = [
  {
    id: "item-1",
    question: "What is the cost of the free plan?",
    answer:
      "Our free plan is completely free, with no monthly or annual charges. It's a great way to get started and explore our basic features.",
  },
  {
    id: "item-2",
    question: "How much does the Basic Monthly plan cost?",
    answer:
      "The Basic Monthly plan is priced at $15 per month. It provides access to our core features and is billed on a monthly basis.",
  },
  {
    id: "item-3",
    question: "What is the price of the Pro Monthly plan?",
    answer:
      "The Pro Monthly plan is available for $25 per month. It offers advanced features and is billed on a monthly basis for added flexibility.",
  },
  {
    id: "item-4",
    question: "Do you offer any annual subscription plans?",
    answer:
      "Yes, we offer annual subscription plans for even more savings. The Basic Annual plan is $144 per year, and the Pro Annual plan is $300 per year.",
  },
  {
    id: "item-5",
    question: "Is there a trial period for the paid plans?",
    answer:
      "We offer a 14-day free trial for both the Pro Monthly and Pro Annual plans. It's a great way to experience all the features before committing to a paid subscription.",
  },
];

export function PricingFaq() {
  return (
    <MaxWidthWrapper>
      <section className="mx-auto max-w-4xl py-2">
        <HeaderSection
          label="FAQ"
          title="Frequently Asked Questions"
          subtitle="Explore our comprehensive FAQ to find quick answers to common inquiries. If you need further assistance, don't hesitate to contact us for personalized help."
        />

        {/* Switched to flex-col with gaps to create the separated card effect */}
        <Accordion
          type="single"
          collapsible
          className="my-12 flex w-full flex-col gap-4"
        >
          {pricingFaqData.map((faqItem) => (
            <AccordionItem
              key={faqItem.id}
              value={faqItem.id}
              // Override default bottom borders and apply card styling
              className="border-border/60 bg-card rounded-2xl border px-2 shadow-sm transition-all hover:shadow-md"
            >
              <AccordionTrigger className="text-foreground/90 hover:text-foreground px-4 py-4 text-left text-[15px] font-medium transition-colors hover:no-underline">
                {faqItem.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground px-4 pb-4 text-sm leading-relaxed sm:text-[15px]">
                {faqItem.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </MaxWidthWrapper>
  );
}
