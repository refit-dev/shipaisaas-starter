"use client";

import React, { useId, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";

export type TestimonialItem = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export function TestimonialsColumn({
  className,
  testimonials,
  duration = 10,
}: {
  className?: string;
  testimonials: TestimonialItem[];
  duration?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const [paused, setPaused] = useState(false);

  return (
    <div
      className={`w-72 shrink-0 ${className ?? ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes scroll-${id} {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
      `}</style>
      <div
        style={shouldReduceMotion ? undefined : {
          animation: `scroll-${id} ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
        className="flex flex-col gap-4 pb-4"
      >
        {[...Array(2)].map((_, dupIndex) => (
          <React.Fragment key={dupIndex}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <div
                key={i}
                className="border border-border bg-card p-6 transition-colors duration-300 hover:bg-accent/50"
              >
                <p className="text-foreground/70 text-sm leading-relaxed">
                  &ldquo;{text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-border">
                    <Image src={image} alt={name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-foreground text-xs font-semibold tracking-tight">
                      {name}
                    </p>
                    <p className="text-muted-foreground text-[10px]">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
