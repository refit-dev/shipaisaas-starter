import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { CtaButton } from "@/components/shared/cta-button";
import { InstallCommand } from "@/components/shared/install-command";
import { Loop, Squiggle } from "@/components/shared/ornaments";

const AVATARS = [
  { src: "https://randomuser.me/api/portraits/men/1.jpg", alt: "John D." },
  { src: "https://randomuser.me/api/portraits/women/2.jpg", alt: "Alice S." },
  { src: "https://randomuser.me/api/portraits/men/3.jpg", alt: "David J." },
  { src: "https://randomuser.me/api/portraits/men/5.jpg", alt: "Michael W." },
  { src: "https://randomuser.me/api/portraits/women/6.jpg", alt: "Sophia G." },
];

export default function HeroLanding() {
  return (
    <section className="bg-background text-foreground relative -mt-16 w-full overflow-hidden">
      {/* Brand glow behind the headline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px]"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 0%, var(--hero-glow) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <Loop className="text-foreground/15 pointer-events-none absolute top-52 -left-12 hidden w-56 lg:block" />

      <div className="relative z-10 flex flex-col items-center px-6 pt-32 pb-0 md:px-16">
        {/* The first thing a developer actually does */}
        <div
          className="mb-9"
          style={{
            opacity: 0,
            animation: "word-appear 0.35s ease-out forwards",
          }}
        >
          <InstallCommand command="npx degit jeanchrinot/shipaisaas-starter my-app" />
        </div>

        {/* Headline */}
        <div className="mx-auto mb-4 w-full max-w-4xl text-center">
          <h1 className="font-display text-foreground text-4xl leading-[1.02] font-extrabold tracking-[-0.035em] md:text-5xl lg:text-6xl">
            <span
              className="block"
              style={{
                opacity: 0,
                animation: "word-appear 0.35s ease-out 0.05s forwards",
              }}
            >
              Ship your AI SaaS
            </span>
            <span
              className="relative mt-2 block"
              style={{
                opacity: 0,
                animation: "word-appear 0.35s ease-out 0.1s forwards",
              }}
            >
              in a weekend
              <Squiggle className="text-primary absolute -bottom-3 left-1/2 h-4 w-[min(52%,20rem)] -translate-x-1/2 md:-bottom-4 md:h-5" />
            </span>
          </h1>

          <p
            className="text-muted-foreground mx-auto mt-9 max-w-xl text-base leading-relaxed md:text-lg"
            style={{
              opacity: 0,
              animation: "word-appear 0.35s ease-out 0.15s forwards",
            }}
          >
            Auth, Postgres, Stripe subscriptions, transactional email and a
            streaming AI layer — wired together and ready to deploy. MIT
            licensed, so whatever you build on it is yours.
          </p>

          {/* CTAs */}
          <div
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{
              opacity: 0,
              animation: "word-appear 0.35s ease-out 0.2s forwards",
            }}
          >
            <CtaButton href="/signup" label="Start for $0" size="lg" />
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                rounded: "full",
              })}
            >
              Star on GitHub
              <ArrowUpRight className="ml-1 size-4" />
            </Link>
          </div>

          {/* Social proof */}
          <div
            className="mt-10 flex items-center justify-center gap-4"
            style={{
              opacity: 0,
              animation: "word-appear 0.35s ease-out 0.25s forwards",
            }}
          >
            <div className="flex items-center -space-x-2.5">
              {AVATARS.map((avatar) => (
                <div
                  key={avatar.src}
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
            <div className="bg-border h-8 w-px" />
            <div className="flex flex-col gap-1 text-left">
              <div className="text-primary flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="size-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                Trusted by 10,000+ forward-thinking teams
              </p>
            </div>
          </div>
        </div>

        {/* Product shot */}
        <div
          className="relative mx-auto mt-20 w-full max-w-5xl"
          style={{
            marginBottom: "-40px",
            opacity: 0,
            animation: "word-appear 0.35s ease-out 0.3s forwards",
          }}
        >
          <div
            className="pointer-events-none absolute -inset-x-10 -top-10 bottom-10"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 40%, var(--hero-glow) 0%, transparent 75%)",
            }}
            aria-hidden
          />
          <div className="border-border bg-card relative z-10 overflow-hidden rounded-2xl border shadow-2xl">
            <Image
              src="/_static/ui-ss/dashboard.png"
              alt="Dashboard preview"
              width={1349}
              height={632}
              priority
              className="w-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
