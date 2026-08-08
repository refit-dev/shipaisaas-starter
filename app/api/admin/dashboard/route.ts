import { and, count, desc, eq, isNotNull, ne, sum } from "drizzle-orm";

import { withAdminAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { monthlyUsages, teams, users } from "@/lib/db/schema/account";

export const GET = withAdminAuth(async ({ user }) => {
  // 1. Strict Security Check: Only global admins can access this data
  if (user.role !== "admin" && user.role !== "superadmin") {
    return Response.json(
      { error: "Unauthorized access. Admins only." },
      { status: 403 },
    );
  }

  try {
    // 2. Fetch all required metrics in parallel for maximum performance
    const [
      totalUsersResult,
      totalTeamsResult,
      activeSubsResult,
      tokenUsageResult,
      recentSignups,
    ] = await Promise.all([
      // Count total registered users
      db.select({ value: count() }).from(users),

      // Count total workspaces created
      db.select({ value: count() }).from(teams),

      // Count teams on a paid plan (planName is set and is not "free")
      db
        .select({ value: count() })
        .from(teams)
        .where(and(isNotNull(teams.planName), ne(teams.planName, "free"))),

      // Sum all tokens ever processed across all workspaces
      db
        .select({
          total: sum(monthlyUsages.totalTokens),
        })
        .from(monthlyUsages),

      // Get the 10 most recent user signups
      db.query.users.findMany({
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
        orderBy: [desc(users.createdAt)],
        limit: 10,
      }),
    ]);

    // 3. Format the response to match the exact shape expected by AdminDashboardClient
    return Response.json({
      kpis: {
        totalUsers: totalUsersResult[0]?.value ?? 0,
        totalOrganizations: totalTeamsResult[0]?.value ?? 0,
        activeSubscriptions: activeSubsResult[0]?.value ?? 0,
        // Drizzle sum() returns a string or null, so we safely parse it
        totalTokensUsed: Number(tokenUsageResult[0]?.total || 0),
      },
      recentSignups,
    });
  } catch (error) {
    console.error("Admin Dashboard API Error:", error);
    return Response.json(
      { error: "Failed to fetch admin dashboard data." },
      { status: 500 },
    );
  }
});
