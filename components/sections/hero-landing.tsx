"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { SlidingButton } from "@/components/shared/sliding-button";

const AVATARS = [
  { src: "https://randomuser.me/api/portraits/men/1.jpg", alt: "John D." },
  { src: "https://randomuser.me/api/portraits/women/2.jpg", alt: "Alice S." },
  { src: "https://randomuser.me/api/portraits/men/3.jpg", alt: "David J." },
  { src: "https://randomuser.me/api/portraits/men/5.jpg", alt: "Michael W." },
  { src: "https://randomuser.me/api/portraits/women/6.jpg", alt: "Sophia G." },
];

export default function HeroLanding() {
  const t = useTranslations("marketing.hero");
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const words = document.querySelectorAll<HTMLElement>(".word");
    words.forEach((word) => {
      const delay = parseInt(word.getAttribute("data-delay") ?? "0", 10);
      setTimeout(() => {
        word.style.animation = "word-appear 0.8s ease-out forwards";
      }, delay);
    });

    const gradient = gradientRef.current;
    function onMouseMove(e: MouseEvent) {
      if (gradient) {
        gradient.style.left = e.clientX - 192 + "px";
        gradient.style.top = e.clientY - 192 + "px";
        gradient.style.opacity = "1";
      }
    }
    function onMouseLeave() {
      if (gradient) gradient.style.opacity = "0";
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    words.forEach((word) => {
      word.addEventListener("mouseenter", () => {
        word.style.textShadow = "0 0 20px rgba(0, 0, 0, 0.2)";
      });
      word.addEventListener("mouseleave", () => {
        word.style.textShadow = "none";
      });
    });

    function onClick(e: MouseEvent) {
      const ripple = document.createElement("div");
      ripple.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:4px;height:4px;background:rgba(0,0,0,0.12);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;animation:pulse-glow 1s ease-out forwards`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    }
    document.addEventListener("click", onClick);

    let scrolled = false;
    function onScroll() {
      if (!scrolled) {
        scrolled = true;
        document
          .querySelectorAll<HTMLElement>(".floating-element")
          .forEach((el, i) => {
            setTimeout(() => {
              el.style.animationPlayState = "running";
            }, i * 200);
          });
      }
    }
    window.addEventListener("scroll", onScroll);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className="text-foreground relative -mt-14 w-full"
      style={{
        background:
          "linear-gradient(to bottom right, var(--hero-bg-from) 0%, var(--muted) 55%, var(--background) 100%)",
      }}
    >
      {/* SVG Grid */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <pattern
            id="hero-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="var(--hero-grid-base)"
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
        <line
          x1="0"
          y1="20%"
          x2="100%"
          y2="20%"
          className="grid-line"
          style={{ animationDelay: "0.5s" }}
        />
        <line
          x1="0"
          y1="80%"
          x2="100%"
          y2="80%"
          className="grid-line"
          style={{ animationDelay: "1s" }}
        />
        <line
          x1="20%"
          y1="0"
          x2="20%"
          y2="100%"
          className="grid-line"
          style={{ animationDelay: "1.5s" }}
        />
        <line
          x1="80%"
          y1="0"
          x2="80%"
          y2="100%"
          className="grid-line"
          style={{ animationDelay: "2s" }}
        />
        <line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          className="grid-line"
          style={{ animationDelay: "2.5s", opacity: 0.05 }}
        />
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          className="grid-line"
          style={{ animationDelay: "3s", opacity: 0.05 }}
        />
        <circle
          cx="20%"
          cy="20%"
          r="2"
          className="detail-dot"
          style={{ animationDelay: "3s" }}
        />
        <circle
          cx="80%"
          cy="20%"
          r="2"
          className="detail-dot"
          style={{ animationDelay: "3.2s" }}
        />
        <circle
          cx="20%"
          cy="80%"
          r="2"
          className="detail-dot"
          style={{ animationDelay: "3.4s" }}
        />
        <circle
          cx="80%"
          cy="80%"
          r="2"
          className="detail-dot"
          style={{ animationDelay: "3.6s" }}
        />
        <circle
          cx="50%"
          cy="50%"
          r="1.5"
          className="detail-dot"
          style={{ animationDelay: "4s" }}
        />
      </svg>

      {/* Floating particles */}
      <div
        className="floating-element"
        style={{ top: "25%", left: "15%", animationDelay: "5s" }}
      />
      <div
        className="floating-element"
        style={{ top: "60%", left: "85%", animationDelay: "5.5s" }}
      />
      <div
        className="floating-element"
        style={{ top: "40%", left: "10%", animationDelay: "6s" }}
      />
      <div
        className="floating-element"
        style={{ top: "75%", left: "90%", animationDelay: "6.5s" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-28 pb-0 md:px-16 md:pt-32">
        {/* Top label */}
        <div
          className="mb-6 text-center"
          style={{ opacity: 0, animation: "word-appear 0.8s ease-out 0.2s forwards" }}
        >
          <h2 className="text-muted-foreground font-mono text-xs font-light tracking-[0.2em] uppercase md:text-sm">
            {t("label")}
          </h2>
          <div className="via-foreground/20 mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent to-transparent" />
        </div>

        {/* Headline + subtext + CTAs + social proof */}
        <div className="mx-auto mb-4 w-full max-w-5xl text-center">
          <h1 className="text-foreground text-4xl leading-tight font-extralight tracking-tight md:text-6xl lg:text-7xl">
            <div
              className="mb-3 md:mb-2"
              style={{ opacity: 0, animation: "word-appear 0.8s ease-out 0.6s forwards" }}
            >
              {t("headline")}
            </div>
            <div
              className="text-muted-foreground text-xl leading-tight font-thin md:text-3xl lg:text-4xl"
              style={{ opacity: 0, animation: "word-appear 0.8s ease-out 1.0s forwards" }}
            >
              {t("subline")}
            </div>
          </h1>

          {/* Description */}
          <p
            className="text-muted-foreground mx-auto mt-6 max-w-xl text-sm leading-relaxed font-light md:text-base"
            style={{
              opacity: 0,
              animation: "word-appear 0.8s ease-out 1.4s forwards",
            }}
          >
            {t("subheadline")}
          </p>

          {/* CTAs */}
          <div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{
              opacity: 0,
              animation: "word-appear 0.8s ease-out 1.8s forwards",
            }}
          >
            <SlidingButton href="/signup" label={t("ctaPrimary")} />
            <Link
              href="/pricing"
              prefetch={true}
              className="hero-btn-secondary group text-foreground inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-semibold tracking-wide"
            >
              {t("ctaSecondary")}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Avatar trust stack */}
          <div
            className="mt-8 flex items-center justify-center gap-4"
            style={{
              opacity: 0,
              animation: "word-appear 0.8s ease-out 2.1s forwards",
            }}
          >
            <div className="flex items-center -space-x-2.5">
              {AVATARS.map((avatar, i) => (
                <div
                  key={i}
                  className="border-background relative size-8 overflow-hidden rounded-full border-2"
                >
                  <Image
                    src={avatar.src}
                    alt={avatar.alt}
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="bg-foreground/15 h-8 w-px" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="text-foreground h-3.5 w-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">{t("trust")}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div
          className="relative mx-auto mt-16 w-full max-w-5xl"
          style={{
            marginBottom: "-40px",
            opacity: 0,
            animation: "word-appear 1s ease-out 2.4s forwards",
          }}
        >
          {/* Neutral bloom above the image */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2"
            style={{
              top: "-60px",
              width: "75%",
              height: "220px",
              zIndex: 1,
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.1) 45%, transparent 72%)",
              filter: "blur(36px)",
            }}
            aria-hidden
          />

          {/* Frame */}
          <div className="relative z-10 overflow-hidden rounded-xl border border-dashed border-border shadow-[0_32px_80px_-12px_rgba(0,0,0,0.4)]">
            <Image
              src="/_static/ui-ss/dashboard.png"
              alt="Dashboard preview"
              width={1349}
              height={632}
              priority
              className="w-full object-cover object-top dark:opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Mouse-follow gradient */}
      <div
        ref={gradientRef}
        className="pointer-events-none fixed h-96 w-96 rounded-full opacity-0 blur-3xl transition-all duration-500 ease-out"
        style={{
          background:
            "radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
