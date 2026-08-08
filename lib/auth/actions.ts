"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth"; // Your better-auth instance
import { db } from "@/lib/db";
import {
  activityLogs,
  ActivityType,
  teams,
  type NewActivityLog,
} from "@/lib/db/schema/account";
import { createCheckoutSession } from "@/lib/payments/stripe";

/**
 * 1. Custom Business Logic: Activity Logging
 * You keep this because Better-Auth doesn't know about your custom activity_logs table.
 */
export async function logActivity(
  teamId: string | null | undefined, // Note: Better-Auth uses string IDs by default
  userId: string,
  type: ActivityType,
  ipAddress?: string,
) {
  if (!teamId) return;

  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || "",
  };
  await db.insert(activityLogs).values(newActivity);
}

/**
 * 2. Custom Business Logic: Payments
 * Keep your Stripe logic. You can wrap it in a session check to ensure security.
 */
export async function handleCheckout(priceId: string, teamId: string) {
  // Better-Auth server-side session check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const team = await db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.id, teamId),
  });

  if (!team) {
    throw new Error("Team not found");
  }

  return createCheckoutSession({ team, priceId });
}

/**
 * 3. Server-Side Role Checks (Optional)
 * While the client has `authClient.useSession()`, you might want server-side helpers
 * for Server Components or API routes.
 */
export async function requireSuperAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "superadmin") {
    throw new Error("Unauthorized");
  }

  return session.user;
}

// User and Team Quick Access
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}

export async function getCurrentTeam() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user && !session?.session?.activeOrganizationId) {
    return null;
  }
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, session.session.activeOrganizationId!),
  });
  return team || null;
}
