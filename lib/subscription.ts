import { UserSubscriptionPlan } from "@/types";
import { eq } from "drizzle-orm";

import { pricingData } from "@/config/subscriptions";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema/account";
import { stripe } from "@/lib/stripe";

type TeamRow = typeof teams.$inferSelect;

async function resolvePlanFromTeam(team: TeamRow): Promise<UserSubscriptionPlan> {
  const isPaid =
    !!team.stripePriceId &&
    !!team.stripeCurrentPeriodEnd &&
    team.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now();

  const matchedPlan =
    pricingData.find((p) => p.stripeIds.monthly === team.stripePriceId) ||
    pricingData.find((p) => p.stripeIds.yearly === team.stripePriceId) ||
    (team.planName
      ? pricingData.find(
          (p) => p.title.toLowerCase() === team.planName!.toLowerCase(),
        )
      : undefined);

  const plan = isPaid && matchedPlan ? matchedPlan : pricingData[0];

  const interval = isPaid
    ? matchedPlan?.stripeIds.monthly === team.stripePriceId
      ? "month"
      : "year"
    : null;

  let isCanceled = false;
  if (isPaid && team.stripeSubscriptionId) {
    const stripeSub = await stripe.subscriptions.retrieve(team.stripeSubscriptionId);
    isCanceled = stripeSub.cancel_at_period_end;
  }

  return {
    ...plan,
    stripeSubscriptionId: team.stripeSubscriptionId,
    stripeCustomerId: team.stripeCustomerId,
    stripePriceId: team.stripePriceId,
    stripeCurrentPeriodEnd: team.stripeCurrentPeriodEnd?.getTime() ?? null,
    isPaid,
    interval,
    isCanceled,
  };
}

export async function getTeamSubscriptionPlan(
  teamId: string | null | undefined,
): Promise<UserSubscriptionPlan | null> {
  if (!teamId) return null;

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
  });

  if (!team) return null;
  return resolvePlanFromTeam(team);
}
