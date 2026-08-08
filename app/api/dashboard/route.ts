import { and, count, desc, eq, gte, isNull, sql } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { dailyUsages, monthlyUsages } from "@/lib/db/schema/account";
import { assets, workflowRuns, workflows } from "@/lib/db/schema/agent";
import { conversations } from "@/lib/db/schema/chat";

export const GET = withAuth(async ({ team }) => {
  const teamId = team.id;
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    // KPIs
    totalTasks,
    pendingApprovals,
    totalAssets,
    assetsThisWeek,
    activeWorkflows,
    totalRuns,
    // Action center
    actionItems,
    // Recent assets
    recentAssets,
    // Recent tasks (replaces recent runs)
    recentTasks,
    // Asset type breakdown
    assetsByType,
    // Activity chart — runs per day last 30d
    runsPerDay,
    // Activity chart — tasks per day last 30d
    tasksPerDay,
    // Usage snapshot
    monthlyUsage,
  ] = await Promise.all([
    // Total tasks (standalone conversations, no workflow)
    db
      .select({ value: count() })
      .from(conversations)
      .where(and(eq(conversations.teamId, teamId), isNull(conversations.workflowId))),

    // Pending approvals count
    db
      .select({ value: count() })
      .from(workflowRuns)
      .innerJoin(workflows, eq(workflowRuns.workflowId, workflows.id))
      .where(
        and(
          eq(workflows.teamId, teamId),
          eq(workflowRuns.status, "awaiting_approval"),
        ),
      ),

    // Total assets
    db.select({ value: count() }).from(assets).where(eq(assets.teamId, teamId)),

    // Assets this week
    db
      .select({ value: count() })
      .from(assets)
      .where(and(eq(assets.teamId, teamId), gte(assets.createdAt, sevenDaysAgo))),

    // Active workflows count
    db
      .select({ value: count() })
      .from(workflows)
      .where(and(eq(workflows.teamId, teamId), eq(workflows.status, "active"))),

    // Total runs (for time-saved metric)
    db
      .select({ value: count() })
      .from(workflowRuns)
      .innerJoin(workflows, eq(workflowRuns.workflowId, workflows.id))
      .where(eq(workflows.teamId, teamId)),

    // Action items: awaiting_approval + failed runs
    db.query.workflowRuns.findMany({
      where: (runs, { and: andFn, inArray }) =>
        andFn(inArray(runs.status, ["awaiting_approval", "failed"])),
      with: {
        workflow: { columns: { id: true, title: true, teamId: true } },
      },
      orderBy: [desc(workflowRuns.updatedAt)],
      limit: 5,
    }),

    // Recent assets (6 most recent)
    db.query.assets.findMany({
      where: eq(assets.teamId, teamId),
      orderBy: [desc(assets.createdAt)],
      limit: 6,
    }),

    // Recent tasks: 10 most recent conversations (tasks + workflow-linked)
    db.query.conversations.findMany({
      where: eq(conversations.teamId, teamId),
      orderBy: [desc(conversations.updatedAt)],
      limit: 10,
      columns: { id: true, title: true, niche: true, workflowId: true, updatedAt: true },
    }),

    // Asset type distribution
    db
      .select({ type: assets.type, count: count() })
      .from(assets)
      .where(eq(assets.teamId, teamId))
      .groupBy(assets.type),

    // Workflow runs per day for last 30 days
    db
      .select({
        date: sql<string>`DATE(${workflowRuns.createdAt})`.as("date"),
        count: count(),
      })
      .from(workflowRuns)
      .innerJoin(workflows, eq(workflowRuns.workflowId, workflows.id))
      .where(
        and(eq(workflows.teamId, teamId), gte(workflowRuns.createdAt, thirtyDaysAgo)),
      )
      .groupBy(sql`DATE(${workflowRuns.createdAt})`)
      .orderBy(sql`DATE(${workflowRuns.createdAt})`),

    // Tasks (standalone conversations) per day for last 30 days
    db
      .select({
        date: sql<string>`DATE(${conversations.createdAt})`.as("date"),
        count: count(),
      })
      .from(conversations)
      .where(
        and(
          eq(conversations.teamId, teamId),
          isNull(conversations.workflowId),
          gte(conversations.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`DATE(${conversations.createdAt})`)
      .orderBy(sql`DATE(${conversations.createdAt})`),

    // Monthly usage snapshot
    db.query.monthlyUsages.findFirst({
      where: and(
        eq(monthlyUsages.teamId, teamId),
        eq(monthlyUsages.month, now.getMonth() + 1),
        eq(monthlyUsages.year, now.getFullYear()),
      ),
    }),
  ]);

  // Filter action items to only this team's workflows
  const filteredActionItems = actionItems.filter(
    (r) => r.workflow?.teamId === teamId,
  );

  // Merge runs + tasks into a single dual-series chart dataset
  const activityChartData = fillMissingDaysActivity(
    runsPerDay.map((r) => ({ date: r.date, runs: Number(r.count) })),
    tasksPerDay.map((r) => ({ date: r.date, tasks: Number(r.count) })),
    thirtyDaysAgo,
    now,
  );

  // Time saved: each run ≈ 15 minutes
  const minutesSaved = (totalRuns[0]?.value ?? 0) * 15;
  const hoursSaved = Math.floor(minutesSaved / 60);

  return Response.json({
    kpis: {
      totalTasks: totalTasks[0]?.value ?? 0,
      pendingApprovals: pendingApprovals[0]?.value ?? 0,
      totalAssets: totalAssets[0]?.value ?? 0,
      assetsThisWeek: assetsThisWeek[0]?.value ?? 0,
      activeWorkflows: activeWorkflows[0]?.value ?? 0,
      totalRuns: totalRuns[0]?.value ?? 0,
      hoursSaved,
    },
    actionItems: filteredActionItems,
    recentAssets,
    recentTasks,
    assetsByType,
    activityChartData,
    usage: monthlyUsage ?? null,
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fillMissingDaysActivity(
  runs: { date: string; runs: number }[],
  tasks: { date: string; tasks: number }[],
  from: Date,
  to: Date,
): { date: string; runs: number; tasks: number }[] {
  const runsMap = new Map(runs.map((d) => [d.date, d.runs]));
  const tasksMap = new Map(tasks.map((d) => [d.date, d.tasks]));
  const result: { date: string; runs: number; tasks: number }[] = [];
  const cursor = new Date(from);

  while (cursor <= to) {
    const key = cursor.toISOString().slice(0, 10);
    result.push({ date: key, runs: runsMap.get(key) ?? 0, tasks: tasksMap.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}
