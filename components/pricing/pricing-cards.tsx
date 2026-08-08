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
        "group relative flex flex-col border-r border-border transition-colors duration-300",
        isPro ? "bg-card" : "bg-background",
        "hover:bg-accent/50",
      )}
    >
      {/* Featured top accent */}
      {isPro && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--foreground), transparent)",
            opacity: 0.3,
          }}
        />
      )}

      <div className="flex flex-1 flex-col p-7">
        {/* Plan name + badge */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
            {offer.title}
          </p>
          {isPro && (
            <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.15em]">Most popular</p>
          )}
        </div>

        {/* Price */}
        <div className="mb-1 flex items-baseline gap-2">
          {isYearly && offer.prices.monthly > 0 && (
            <span className="text-muted-foreground text-lg line-through">
              ${offer.prices.monthly}
            </span>
          )}
          <span className="text-foreground text-4xl font-bold tracking-tight">
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
                className="inline-flex w-full items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm text-foreground/70 transition-colors group-hover:bg-foreground group-hover:text-background group-hover:border-foreground"
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
                "inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                isPro
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "border border-border text-foreground/70 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground",
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
        <h2 className="text-foreground font-display text-2xl tracking-tight text-balance md:text-3xl lg:text-4xl">Start at full speed!</h2>
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
      <div className="overflow-hidden border border-border grid grid-cols-1 lg:grid-cols-3">
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
