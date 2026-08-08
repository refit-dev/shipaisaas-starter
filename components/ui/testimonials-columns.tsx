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
      className={`w-80 shrink-0 ${className ?? ""}`}
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
        style={
          shouldReduceMotion
            ? undefined
            : {
                animation: `scroll-${id} ${duration}s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
              }
        }
        className="flex flex-col gap-4 pb-4"
      >
        {[...Array(2)].map((_, dupIndex) => (
          <React.Fragment key={dupIndex}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <figure
                key={i}
                className="group bg-card hover:border-primary/40 relative overflow-hidden rounded-2xl border p-6 transition-colors duration-200"
              >
                {/* Colour wash that warms on hover */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(110% 80% at 0% 0%, color-mix(in oklab, var(--chart-1) 18%, transparent) 0%, transparent 60%)",
                  }}
                  aria-hidden
                />

                <span
                  className="text-primary/30 font-display relative block text-7xl leading-[0.6] font-bold"
                  aria-hidden
                >
                  &ldquo;
                </span>

                <blockquote className="text-foreground/85 relative mt-4 text-sm leading-relaxed">
                  {text}
                </blockquote>

                <figcaption className="relative mt-6 flex items-center gap-3">
                  <div className="border-border relative size-9 shrink-0 overflow-hidden rounded-full border">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold tracking-tight">
                      {name}
                    </p>
                    <p className="text-muted-foreground text-xs">{role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
