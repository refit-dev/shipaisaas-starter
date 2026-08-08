"use client";

import { motion, useReducedMotion } from "motion/react";

import { testimonials as rawTestimonials } from "@/config/landing";
import { duration, ease, viewport } from "@/config/motion";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns";

const mapped = rawTestimonials.map((t) => ({
  text: t.review,
  image: t.image,
  name: t.name,
  role: t.job,
}));

const colAll = mapped;
const col1   = mapped.filter((_, i) => i % 3 === 0);
const col2   = mapped.filter((_, i) => i % 3 === 1);
const col3   = mapped.filter((_, i) => i % 3 === 2);

export default function Testimonials() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-muted/20 py-24 sm:py-32 overflow-hidden">
      <MaxWidthWrapper>
        <motion.div
          className="mx-auto mb-14 max-w-2xl text-center"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: duration.base, ease }}
        >
          <h2 className="text-foreground font-display text-2xl tracking-tight text-balance md:text-3xl lg:text-4xl">Teams that ship faster with AI agents.</h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed text-balance md:text-base">See how operators and founders are automating their workflows and reclaiming time for the work that actually moves the needle.</p>
        </motion.div>
      </MaxWidthWrapper>

      <div
        className="relative mt-16 flex justify-center gap-4 overflow-hidden"
        style={{
          maxHeight: "740px",
          maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <TestimonialsColumn testimonials={colAll} className="md:hidden"       duration={30} />
        <TestimonialsColumn testimonials={col1}   className="hidden md:block" duration={22} />
        <TestimonialsColumn testimonials={col2}   className="hidden md:block" duration={25} />
        <TestimonialsColumn testimonials={col3}   className="hidden lg:block" duration={28} />
      </div>
    </section>
  );
}
