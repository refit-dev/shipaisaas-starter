import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { pricingData } from "@/config/subscriptions";
import { db } from "@/lib/db";
import { getTeamByStripeCustomerId } from "@/lib/db/queries";
import { teams } from "@/lib/db/schema/account"; // Adjust path to your schema
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersData = await headers();
  const signature = headersData.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // If this webhook was triggered by the sales app, ignore it
    // Remove this check for your own saas
    if (session.metadata?.app_source === "shipaisaas_sales") {
      return new Response("Ignored: Event belongs to another app", {
        status: 200,
      });
    }

    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // Get the teamId from the checkout session metadata
    const teamId = session?.metadata?.teamId;
    const stripePriceId = subscription.items.data[0].price.id;

    if (!teamId) {
      console.error("Webhook Error: Missing teamId in metadata");
      return new Response("Webhook Error: Missing teamId in metadata", {
        status: 400,
      });
    }

    const plan = pricingData.find(
      (item) =>
        item.stripeIds.monthly === stripePriceId ||
        item.stripeIds.yearly === stripePriceId,
    );

    if (!plan) {
      console.error("Webhook Error: Pricing plan not found");
      return new Response("Webhook Error: Pricing plan not found", {
        status: 400,
      });
    }

    const planName = plan.title;

    // Drizzle Update: Initial Subscription
    await db
      .update(teams)
      .set({
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId,
        stripeCurrentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000,
        ),
        planName,
      })
      .where(eq(teams.id, teamId));
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    // If the billing reason is not subscription_create, it means the customer has updated their subscription.
    // If it is subscription_create, it will be handled by checkout.session.completed.
    if (invoice.billing_reason !== "subscription_create") {
      const team = await getTeamByStripeCustomerId(invoice.customer as string);
      const subscriptionId = team?.stripeSubscriptionId as string;

      if (subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        const stripePriceId = subscription.items.data[0].price.id;

        const plan = pricingData.find(
          (item) =>
            item.stripeIds.monthly === stripePriceId ||
            item.stripeIds.yearly === stripePriceId,
        );

        if (!plan) {
          console.error("Webhook Error: Pricing plan not found");
          return new Response("Webhook Error: Pricing plan not found", {
            status: 400,
          });
        }

        const planName = plan.title;

        // Drizzle Update: Renew/Update Subscription
        await db
          .update(teams)
          .set({
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000,
            ),
            planName,
          })
          .where(eq(teams.stripeSubscriptionId, subscription.id));
      }
    }
  }

  // TODO : Handle Cancellation

  return new Response(null, { status: 200 });
}
