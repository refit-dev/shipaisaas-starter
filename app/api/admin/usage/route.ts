import { and, eq, gte } from "drizzle-orm";

import { pricingData } from "@/config/subscriptions";
import { withAdminAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { dailyUsages, monthlyUsages, teams } from "@/lib/db/schema/account";

export const POST = withAdminAuth(async ({ req }) => {
  try {
    const body = await req.json();
    const days = body.days || 30;
    const teamId = body.teamId || "all";

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    let limits = {
      monthlyRequests: 0,
      dailyRequests: 0,
      maxTokensPerRequest: 0,
    };
    let planName = "Global Platform";

    // 1. Fetch Limits if a specific team is selected
    if (teamId !== "all") {
      const team = await db.query.teams.findFirst({
        where: eq(teams.id, teamId),
      });

      if (team) {
        planName = team.planName || "free";
        const userPlan = pricingData.find(
          (item) => item.title.toLowerCase() === planName.toLowerCase(),
        );
        if (userPlan?.usageLimits) limits = userPlan.usageLimits;
      }
    }

    // 2. Build Database Filters
    const monthlyFilter =
      teamId === "all"
        ? and(
            eq(monthlyUsages.month, currentMonth),
            eq(monthlyUsages.year, currentYear),
          )
        : and(
            eq(monthlyUsages.teamId, teamId),
            eq(monthlyUsages.month, currentMonth),
            eq(monthlyUsages.year, currentYear),
          );

    const dailyFilter =
      teamId === "all"
        ? gte(dailyUsages.date, startDate)
        : and(eq(dailyUsages.teamId, teamId), gte(dailyUsages.date, startDate));

    // 3. Fetch Raw Data
    const [monthlyDataRaw, dailyDataRaw] = await Promise.all([
      db.select().from(monthlyUsages).where(monthlyFilter),
      db.select().from(dailyUsages).where(dailyFilter),
    ]);

    // 4. Aggregate Monthly Data (handles both global and single team)
    const aggregatedMonthly = monthlyDataRaw.reduce(
      (acc, curr) => ({
        inputTokens: acc.inputTokens + (curr.inputTokens || 0),
        outputTokens: acc.outputTokens + (curr.outputTokens || 0),
        totalTokens: acc.totalTokens + (curr.totalTokens || 0),
        requests: acc.requests + (curr.requests || 0),
      }),
      { inputTokens: 0, outputTokens: 0, totalTokens: 0, requests: 0 },
    );

    // 5. Aggregate and Format Daily Data
    const formattedDailyData = [];
    for (let i = 0; i < days; i++) {
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + i);
      const dateString = targetDate.toISOString().split("T")[0];

      // Find all rows for this specific day (might be multiple if global)
      const daysData = dailyDataRaw.filter(
        (d) => d.date.toISOString().split("T")[0] === dateString,
      );

      // Sum up the data for this day
      const dayTotal = daysData.reduce(
        (acc, curr) => ({
          inputTokens: acc.inputTokens + (curr.inputTokens || 0),
          outputTokens: acc.outputTokens + (curr.outputTokens || 0),
          requests: acc.requests + (curr.requests || 0),
        }),
        { inputTokens: 0, outputTokens: 0, requests: 0 },
      );

      formattedDailyData.push({
        date: dateString,
        inputTokens: dayTotal.inputTokens,
        outputTokens: dayTotal.outputTokens,
        requests: dayTotal.requests,
      });
    }

    const todayUsage = formattedDailyData[formattedDailyData.length - 1];

    return Response.json({
      monthly: aggregatedMonthly,
      today: todayUsage,
      daily: formattedDailyData,
      limits,
      planName,
      isGlobal: teamId === "all",
    });
  } catch (error) {
    console.error("Admin Usage API Error:", error);
    return Response.json(
      { error: "Failed to fetch usage data" },
      { status: 500 },
    );
  }
});
