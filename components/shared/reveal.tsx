"use client";

import { motion, useReducedMotion } from "motion/react";

import { duration, ease, staggerDelay, viewport } from "@/config/motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Position within a group of peers — adds a small stagger. */
  index?: number;
  /** Extra delay in seconds, before any stagger. */
  delay?: number;
  /** Slower variant for a hero-weight element. */
  slow?: boolean;
};

/**
 * The one scroll reveal used across the site: rise a little, fade in, done in
 * ~250ms. Timings come from config/motion.ts — change them there, not here.
 *
 * Wrap a container, not each of its children. If a group genuinely needs to
 * arrive in sequence, pass `index` and the stagger stays inside the budget.
 */
export function Reveal({
  children,
  className,
  index = 0,
  delay = 0,
  slow = false,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{
        duration: slow ? duration.slow : duration.base,
        delay: staggerDelay(index, delay),
        ease,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
