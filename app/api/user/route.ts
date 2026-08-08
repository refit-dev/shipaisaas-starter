import { headers } from "next/headers";
import { and, eq, inArray } from "drizzle-orm";
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
import {
  assets,
  memories,
  workflowRuns,
  workflows,
  workflowSteps,
} from "@/lib/db/schema/agent";
import { conversations } from "@/lib/db/schema/chat";
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
    // Get all workflow IDs for this team
    const teamWorkflows = await db
      .select({ id: workflows.id })
      .from(workflows)
      .where(eq(workflows.teamId, teamId));
    const workflowIds = teamWorkflows.map((w) => w.id);

    // 1. Unlink conversations from workflows (FK: conversations.workflowId → workflows.id, no cascade)
    await db
      .update(conversations)
      .set({ workflowId: null })
      .where(eq(conversations.teamId, teamId));

    // 2. Delete assets first (assets.runId → workflowRuns.id; assets.conversationId → conversations.id)
    await db.delete(assets).where(eq(assets.teamId, teamId));

    // 3. Delete workflowRuns (references workflowId + conversationId)
    if (workflowIds.length > 0) {
      await db.delete(workflowRuns).where(inArray(workflowRuns.workflowId, workflowIds));
      await db.delete(workflowSteps).where(inArray(workflowSteps.workflowId, workflowIds));
    }

    // 4. Delete workflows
    await db.delete(workflows).where(eq(workflows.teamId, teamId));

    // 5. Delete other team-scoped data
    await db.delete(memories).where(eq(memories.teamId, teamId));
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
