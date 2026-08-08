"use client";


import { FallingPattern } from "@/components/ui/falling-pattern";
import { SlidingButton } from "@/components/shared/sliding-button";

export default function BottomCta() {

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "rgb(8, 8, 8)" }}>
      {/* Static dot grid — mobile only */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(200,200,200,0.15) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Animated falling pattern — desktop only */}
      <div className="absolute inset-0 hidden md:block">
        <FallingPattern
          color="rgba(200, 200, 200, 0.22)"
          backgroundColor="rgb(8, 8, 8)"
          duration={80}
          blurIntensity="0.15rem"
          density={2}
          className="h-full w-full"
        />
      </div>

      <div className="relative z-20 flex min-h-[440px] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex flex-col items-center gap-6 max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/50">Get Started</p>
          <h2 className="max-w-3xl font-display text-4xl tracking-tight text-white text-balance sm:text-5xl">Ready to ship your AI SaaS?</h2>
          <p className="max-w-xl text-base font-light leading-relaxed text-white/60 text-balance">Clone the starter, add your keys, and have a working product with auth, billing and AI in an afternoon.</p>
          <div className="mt-2">
            <SlidingButton href="/signup" label={"Get started"} variant="light" />
          </div>
        </div>
      </div>
    </section>
  );
}
