import { and, eq, gte } from "drizzle-orm";

import { pricingData } from "@/config/subscriptions"; // Adjust path to your config
import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { dailyUsages, monthlyUsages, teams } from "@/lib/db/schema/account";

export const POST = withAuth(async ({ req, team }) => {
  try {
    const body = await req.json();
    const days = body.days || 30;

    // 1. Fetch Plan Limits
    // Assumes `team.planName` exists. If not, fetch it from the DB first.
    const userPlan = pricingData.find(
      (item) =>
        item.title.toLowerCase() === (team.planName || "free").toLowerCase(),
    );
    const limits = userPlan?.usageLimits || {
      monthlyRequests: 0,
      dailyRequests: 0,
      maxTokensPerRequest: 0,
    };

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1); // +1 to include today

    // 2. Get Monthly Usage
    const [monthlyData] = await db
      .select()
      .from(monthlyUsages)
      .where(
        and(
          eq(monthlyUsages.teamId, team.id),
          eq(monthlyUsages.month, currentMonth),
          eq(monthlyUsages.year, currentYear),
        ),
      )
      .limit(1);

    // 3. Get Daily Usage
    const dailyDataRaw = await db
      .select()
      .from(dailyUsages)
      .where(
        and(eq(dailyUsages.teamId, team.id), gte(dailyUsages.date, startDate)),
      );

    // 4. Prefill all selected days with 0
    const formattedDailyData = [];
    for (let i = 0; i < days; i++) {
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + i);
      const dateString = targetDate.toISOString().split("T")[0];

      // Find if we have DB data for this specific day
      const existingDay = dailyDataRaw.find(
        (d) => d.date.toISOString().split("T")[0] === dateString,
      );

      formattedDailyData.push({
        date: dateString,
        inputTokens: existingDay?.inputTokens || 0,
        outputTokens: existingDay?.outputTokens || 0,
        credits: existingDay?.credits || 0, // Mapping credits to 'Requests'
      });
    }

    // Get today's usage specifically for the daily limit card
    const todayUsage = formattedDailyData[formattedDailyData.length - 1];

    return new Response(
      JSON.stringify({
        monthly: monthlyData || {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          credits: 0,
        },
        today: todayUsage,
        daily: formattedDailyData,
        limits,
      }),
      { status: 200 },
    );
  } catch (error) {
    return new Response("Failed to fetch usage data", { status: 500 });
  }
});
