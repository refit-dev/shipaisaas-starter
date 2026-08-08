import { and, count, desc, eq, gte, sql } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { monthlyUsages } from "@/lib/db/schema/account";
import { conversations, messages } from "@/lib/db/schema/chat";

export const GET = withAuth(async ({ team }) => {
  const teamId = team.id;
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalConversations,
    conversationsThisWeek,
    totalMessages,
    recentConversations,
    conversationsPerDay,
    monthlyUsage,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(conversations)
      .where(eq(conversations.teamId, teamId)),

    db
      .select({ value: count() })
      .from(conversations)
      .where(
        and(
          eq(conversations.teamId, teamId),
          gte(conversations.createdAt, sevenDaysAgo),
        ),
      ),

    db
      .select({ value: count() })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(eq(conversations.teamId, teamId)),

    db.query.conversations.findMany({
      where: eq(conversations.teamId, teamId),
      orderBy: [desc(conversations.updatedAt)],
      limit: 10,
      columns: { id: true, title: true, updatedAt: true },
    }),

    db
      .select({
        date: sql<string>`DATE(${conversations.createdAt})`.as("date"),
        count: count(),
      })
      .from(conversations)
      .where(
        and(
          eq(conversations.teamId, teamId),
          gte(conversations.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`DATE(${conversations.createdAt})`)
      .orderBy(sql`DATE(${conversations.createdAt})`),

    db.query.monthlyUsages.findFirst({
      where: and(
        eq(monthlyUsages.teamId, teamId),
        eq(monthlyUsages.month, now.getUTCMonth() + 1),
        eq(monthlyUsages.year, now.getUTCFullYear()),
      ),
    }),
  ]);

  const activityChartData = fillMissingDays(
    conversationsPerDay.map((r) => ({
      date: r.date,
      conversations: Number(r.count),
    })),
    thirtyDaysAgo,
    now,
  );

  return Response.json({
    kpis: {
      totalConversations: totalConversations[0]?.value ?? 0,
      conversationsThisWeek: conversationsThisWeek[0]?.value ?? 0,
      totalMessages: totalMessages[0]?.value ?? 0,
      requestsThisMonth: monthlyUsage?.credits ?? 0,
    },
    recentConversations,
    activityChartData,
    usage: monthlyUsage ?? null,
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fillMissingDays(
  rows: { date: string; conversations: number }[],
  from: Date,
  to: Date,
): { date: string; conversations: number }[] {
  const byDate = new Map(rows.map((d) => [d.date, d.conversations]));
  const result: { date: string; conversations: number }[] = [];
  const cursor = new Date(from);

  while (cursor <= to) {
    const key = cursor.toISOString().slice(0, 10);
    result.push({ date: key, conversations: byDate.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}
