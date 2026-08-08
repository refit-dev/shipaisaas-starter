import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth/actions";
import { db } from "@/lib/db";
import {
  activityLogs,
  dailyUsages,
  monthlyUsages,
  teamMembers,
  teams,
  users,
} from "@/lib/db/schema/account";
import { getUser } from "@/lib/db/queries";
import { getTeamSubscriptionPlan } from "@/lib/subscription";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user ? await getUser() : null;
  let subscriptionPlan = null;
  if (user?.id) {
    subscriptionPlan = await getTeamSubscriptionPlan(
      session?.session?.activeOrganizationId,
    );
  }
  return Response.json({ user, subscriptionPlan });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Partial<typeof users.$inferInsert> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim().slice(0, 32);
  }
  if (typeof body.image === "string") {
    updates.image = body.image;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await db.update(users).set(updates).where(eq(users.id, user.id));
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find teams where this user is the owner
  const ownedMemberships = await db.query.teamMembers.findMany({
    where: and(eq(teamMembers.userId, user.id), eq(teamMembers.role, "owner")),
  });
  const ownedTeamIds = ownedMemberships.map((m) => m.teamId);

  for (const teamId of ownedTeamIds) {
    // Delete team-scoped data that has no cascade from teams
    await db.delete(dailyUsages).where(eq(dailyUsages.teamId, teamId));
    await db.delete(monthlyUsages).where(eq(monthlyUsages.teamId, teamId));
    await db.delete(activityLogs).where(eq(activityLogs.teamId, teamId));

    // 6. Delete team — cascades: conversations → messages, teamMembers, invitations
    await db.delete(teams).where(eq(teams.id, teamId));
  }

  // Clean up any remaining activity logs for this user (teamless or from non-owned teams)
  await db.delete(activityLogs).where(eq(activityLogs.userId, user.id));

  // Delete user — cascades: sessions, accounts, teamMembers (other teams), invitations (as inviter), conversations by userId → messages
  await db.delete(users).where(eq(users.id, user.id));

  return NextResponse.json({ success: true });
}
