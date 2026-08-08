"use client";

import { useTranslations } from "next-intl";

import { FallingPattern } from "@/components/ui/falling-pattern";
import { SlidingButton } from "@/components/shared/sliding-button";

export default function BottomCta() {
  const t = useTranslations("marketing.cta");

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
            {t("label")}
          </p>
          <h2 className="max-w-3xl text-4xl font-extralight tracking-tight text-white text-balance sm:text-5xl">
            {t("title")}
          </h2>
          <p className="max-w-xl text-base font-light leading-relaxed text-white/60 text-balance">
            {t("subtitle")}
          </p>
          <div className="mt-2">
            <SlidingButton href="/signup" label={t("button")} variant="light" />
          </div>
        </div>
      </div>
    </section>
  );
}
