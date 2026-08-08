import { PlansRow, SubscriptionPlan } from "@/types";

import { env } from "@/env.mjs";

/**
 * Your pricing tiers.
 *
 * `usageLimits` is enforced server-side by `checkRateLimits()` in
 * lib/utils/usage.ts — one AI request (chat message or task run) counts as one
 * request against the daily and monthly caps.
 */
export const pricingData: SubscriptionPlan[] = [
  {
    title: "Free",
    description: "Kick the tires",
    benefits: [
      "50 AI requests per month",
      "Chat with history",
      "All task templates",
      "Basic usage analytics",
    ],
    limitations: [
      "No priority support",
      "Shorter context per request",
      "No custom branding",
    ],
    usageLimits: {
      monthlyRequests: 50,
      dailyRequests: 10,
      maxTokensPerRequest: 12000,
      maxImageSizeMB: 1,
      maxResolution: 1500,
    },
    prices: {
      monthly: 0,
      yearly: 0,
    },
    stripeIds: {
      monthly: null,
      yearly: null,
    },
  },
  {
    title: "Pro",
    description: "For solo builders shipping real work",
    benefits: [
      "1,000 AI requests per month",
      "Larger context per request",
      "All task templates",
      "Full usage analytics",
      "Email support",
    ],
    limitations: ["No custom branding"],
    usageLimits: {
      monthlyRequests: 1000,
      dailyRequests: 100,
      maxTokensPerRequest: 25000,
      maxImageSizeMB: 2,
      maxResolution: 2000,
    },
    prices: {
      monthly: 19,
      yearly: 180,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
      yearly: env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
    },
  },
  {
    title: "Business",
    description: "For teams with heavier usage",
    benefits: [
      "5,000 AI requests per month",
      "Largest context per request",
      "All task templates",
      "Full usage analytics",
      "Priority support",
    ],
    limitations: [],
    usageLimits: {
      monthlyRequests: 5000,
      dailyRequests: 500,
      maxTokensPerRequest: 40000,
      maxImageSizeMB: 4,
      maxResolution: 2500,
    },
    prices: {
      monthly: 49,
      yearly: 468,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
      yearly: env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
    },
  },
];

export const plansColumns = ["free", "pro", "business", "enterprise"] as const;

export const comparePlans: PlansRow[] = [
  {
    feature: "Monthly AI requests",
    free: "50",
    pro: "1,000",
    business: "5,000",
    enterprise: "Custom",
    tooltip: "One chat message or task run counts as one request.",
  },
  {
    feature: "Daily AI requests",
    free: "10",
    pro: "100",
    business: "500",
    enterprise: "Custom",
    tooltip: "A daily cap keeps a runaway script from burning a whole month.",
  },
  {
    feature: "Context per request",
    free: "12k tokens",
    pro: "25k tokens",
    business: "40k tokens",
    enterprise: "Custom",
  },
  {
    feature: "Model choice",
    free: true,
    pro: true,
    business: true,
    enterprise: true,
    tooltip: "Switch between the models configured in lib/ai/models.ts.",
  },
  {
    feature: "Task templates",
    free: true,
    pro: true,
    business: true,
    enterprise: true,
  },
  {
    feature: "Usage analytics",
    free: "Basic",
    pro: "Full",
    business: "Full",
    enterprise: "Full",
  },
  {
    feature: "File uploads",
    free: "1 MB",
    pro: "2 MB",
    business: "4 MB",
    enterprise: "Custom",
  },
  {
    feature: "Support",
    free: null,
    pro: "Email",
    business: "Priority email",
    enterprise: "Dedicated",
  },
];
