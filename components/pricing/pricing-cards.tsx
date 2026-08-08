"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { UserSubscriptionPlan } from "@/types";
import { SubscriptionPlan } from "@/types/index";
import { pricingData } from "@/config/subscriptions";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BillingFormButton } from "@/components/forms/billing-form-button";
import { duration, ease, staggerDelay, viewport } from "@/config/motion";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Highlight } from "@/components/shared/ornaments";

interface PricingCardsProps {
  userId?: string;
  subscriptionPlan?: UserSubscriptionPlan;
}

function PricingCard({
  offer,
  index,
  isYearly,
  userId,
  subscriptionPlan,
  shouldReduceMotion,
}: {
  offer: SubscriptionPlan;
  index: number;
  isYearly: boolean;
  userId?: string;
  subscriptionPlan?: UserSubscriptionPlan;
  shouldReduceMotion: boolean | null;
}) {
  const benefits = offer.benefits;
  const limitations = offer.limitations;

  const isPro = offer.title.toLowerCase() === "pro";
  const monthlyPrice =
    isYearly && offer.prices.monthly > 0
      ? Math.floor(offer.prices.yearly / 12)
      : offer.prices.monthly;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: duration.base, delay: staggerDelay(index), ease }}
      className={cn(
        "group bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border transition-colors duration-200",
        isPro ? "border-primary/60" : "hover:border-primary/30",
      )}
    >
      {isPro && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 70% at 50% 0%, color-mix(in oklab, var(--primary) 9%, transparent) 0%, transparent 55%)",
          }}
          aria-hidden
        />
      )}

      <div className="relative flex flex-1 flex-col p-7 sm:p-8">
        {/* Plan name + badge */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-foreground text-lg font-semibold">{offer.title}</p>
          {isPro && (
            <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase">
              Most popular
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-1 flex items-baseline gap-2">
          {isYearly && offer.prices.monthly > 0 && (
            <span className="text-muted-foreground text-lg line-through">
              ${offer.prices.monthly}
            </span>
          )}
          <span className="font-display text-foreground text-5xl font-light tracking-[-0.03em]">
            ${monthlyPrice}
          </span>
          <span className="text-muted-foreground text-sm">/mo</span>
        </div>

        <p className="text-muted-foreground h-4 text-xs">
          {isYearly && offer.prices.monthly > 0
            ? `$${offer.prices.yearly} ${"billed annually"}`
            : offer.prices.monthly > 0
              ? "billed monthly"
              : null}
        </p>

        <p className="text-muted-foreground mt-4 text-sm">{offer.description}</p>

        {/* Divider */}
        <div className="border-border my-6 border-t" />

        {/* Features */}
        <ul className="flex flex-1 flex-col gap-3">
          {benefits.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <Check
                className="text-primary mt-0.5 size-3.5 shrink-0"
                strokeWidth={2.5}
              />
              <span className="text-foreground/80 leading-snug">{feature}</span>
            </li>
          ))}
          {limitations.map((feature) => (
            <li
              key={feature}
              className="text-muted-foreground flex items-start gap-3 text-sm"
            >
              <X
                className="text-muted-foreground/40 mt-0.5 size-3.5 shrink-0"
                strokeWidth={2}
              />
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-8">
          {userId && subscriptionPlan ? (
            offer.prices.monthly === 0 ? (
              <Link
                href="/dashboard"
                className="border-border text-foreground/80 hover:bg-secondary inline-flex w-full items-center justify-center rounded-full border px-4 py-3 text-sm font-medium transition-colors"
              >Go to dashboard</Link>
            ) : (
              <BillingFormButton
                year={isYearly}
                offer={offer}
                subscriptionPlan={subscriptionPlan}
              />
            )
          ) : (
            <Link
              href="/login"
              className={cn(
                "inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-medium transition-colors",
                isPro
                  ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                  : "border-border text-foreground/80 hover:bg-secondary border",
              )}
            >Get started</Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function PricingCards({ userId, subscriptionPlan }: PricingCardsProps) {
  const shouldReduceMotion = useReducedMotion();

  const isYearlyDefault =
    !subscriptionPlan?.stripeCustomerId || subscriptionPlan.interval === "year";
  const [isYearly, setIsYearly] = useState<boolean>(!!isYearlyDefault);

  return (
    <MaxWidthWrapper>
      {/* Inline header */}
      <motion.div
        className="mx-auto mb-14 max-w-2xl text-center"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: duration.base, ease }}
      >
        <p className="text-primary mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">Pricing</p>
        <h2 className="text-foreground font-display text-3xl font-extrabold tracking-[-0.03em] text-balance md:text-5xl lg:text-6xl">
          Start at <Highlight>full speed</Highlight>.
        </h2>
      </motion.div>

      {/* Toggle */}
      <div className="mb-8 flex justify-center">
        <ToggleGroup
          type="single"
          size="sm"
          defaultValue={isYearly ? "yearly" : "monthly"}
          onValueChange={() => setIsYearly(!isYearly)}
          aria-label="toggle-year"
          className="bg-muted h-9 rounded-full p-1"
        >
          <ToggleGroupItem
            value="yearly"
            className="data-[state=on]:bg-background data-[state=on]:text-foreground h-7 rounded-full px-4 text-sm"
          >Yearly<span className="text-primary ml-1 text-xs font-semibold">−20%</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="monthly"
            className="data-[state=on]:bg-background data-[state=on]:text-foreground h-7 rounded-full px-4 text-sm"
          >Monthly</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Cards grid */}
      {/* items-stretch (the default) keeps all three the same height however
          long the feature list is; the CTA is pinned to the bottom below. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        {pricingData.map((offer, i) => (
          <PricingCard
            key={offer.title}
            offer={offer}
            index={i}
            isYearly={isYearly}
            userId={userId}
            subscriptionPlan={subscriptionPlan}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </div>

      <p className="text-muted-foreground mt-6 text-center text-sm text-balance">
        {"Questions?"}{" "}
        <a
          className="text-foreground underline underline-offset-4 hover:no-underline"
          href={`mailto:${"support@shipaisaas.com"}`}
        >support@shipaisaas.com</a> · <span className="text-foreground font-medium">{"Test cards won't be charged."}</span>
      </p>
    </MaxWidthWrapper>
  );
}
