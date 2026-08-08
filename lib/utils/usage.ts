import { and, eq, sql } from "drizzle-orm";

import { pricingData } from "@/config/subscriptions";
import { db } from "@/lib/db";
import { dailyUsages, monthlyUsages } from "@/lib/db/schema/account";

type UsageUpdatePayload = {
  teamId: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  credits?: number;
};

/**
 * Updates both daily and monthly usage in a single safe function.
 * Creates the records if they don't exist. Increments each field.
 */
export async function updateUsage({
  teamId,
  inputTokens = 0,
  outputTokens = 0,
  totalTokens = 0,
  credits = 1,
}: UsageUpdatePayload) {
  try {
    const now = new Date();

    // DAILY KEYS - Use UTC methods to prevent timezone shifting
    const dateKey = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    // MONTHLY KEYS - Also safer to use UTC for billing metrics
    const month = now.getUTCMonth() + 1; // 1-12
    const year = now.getUTCFullYear();

    // 1. Ensure daily usage row exists
    const existingDaily = await db.query.dailyUsages.findFirst({
      where: and(eq(dailyUsages.teamId, teamId), eq(dailyUsages.date, dateKey)),
    });

    if (!existingDaily) {
      await db.insert(dailyUsages).values({
        teamId,
        date: dateKey,
      });
    }

    // 2. Ensure monthly usage row exists
    const existingMonthly = await db.query.monthlyUsages.findFirst({
      where: and(
        eq(monthlyUsages.teamId, teamId),
        eq(monthlyUsages.month, month),
        eq(monthlyUsages.year, year),
      ),
    });

    if (!existingMonthly) {
      await db.insert(monthlyUsages).values({
        teamId,
        month,
        year,
      });
    }

    // 3. Increment DAILY usage
    await db
      .update(dailyUsages)
      .set({
        inputTokens: sql`${dailyUsages.inputTokens} + ${inputTokens}`,
        outputTokens: sql`${dailyUsages.outputTokens} + ${outputTokens}`,
        totalTokens: sql`${dailyUsages.totalTokens} + ${totalTokens}`,
        credits: sql`${dailyUsages.credits} + ${credits}`,
        updatedAt: new Date(),
      })
      .where(
        and(eq(dailyUsages.teamId, teamId), eq(dailyUsages.date, dateKey)),
      );

    // 4. Increment MONTHLY usage
    await db
      .update(monthlyUsages)
      .set({
        inputTokens: sql`${monthlyUsages.inputTokens} + ${inputTokens}`,
        outputTokens: sql`${monthlyUsages.outputTokens} + ${outputTokens}`,
        totalTokens: sql`${monthlyUsages.totalTokens} + ${totalTokens}`,
        credits: sql`${monthlyUsages.credits} + ${credits}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(monthlyUsages.teamId, teamId),
          eq(monthlyUsages.month, month),
          eq(monthlyUsages.year, year),
        ),
      );
  } catch (error) {
    console.error("Error updating usage:", error);
  }
}

export async function checkRateLimits({
  teamId,
  plan,
  estimatedTokens,
  fileSizeMB,
  width,
  height,
}: {
  teamId: string;
  plan: string;
  estimatedTokens?: number;
  fileSizeMB?: number;
  width?: number;
  height?: number;
}) {
  const userPlan = pricingData.find(
    (item) => item.title.toLocaleLowerCase() === plan.toLocaleLowerCase(),
  );
  if (!userPlan) throw new Error("User plan not found.");
  if (!userPlan.usageLimits) throw new Error("User plan limits not found.");

  const limits = userPlan.usageLimits;
  const now = new Date();

  // DAILY KEY - UTC to match updateUsage
  const dateKey = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  // MONTHLY KEYS - UTC to match updateUsage
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();

  //
  // ---- 4. Fetch usage
  //
  const daily = await db.query.dailyUsages.findFirst({
    where: and(eq(dailyUsages.teamId, teamId), eq(dailyUsages.date, dateKey)),
  });

  const monthly = await db.query.monthlyUsages.findFirst({
    where: and(
      eq(monthlyUsages.teamId, teamId),
      eq(monthlyUsages.month, month),
      eq(monthlyUsages.year, year),
    ),
  });

  const dailyCount = daily?.credits ?? 0;
  const monthlyCount = monthly?.credits ?? 0;

  //
  // ---- 5. Check daily limit
  //
  if (dailyCount >= limits.dailyRequests) {
    throw new Error("Daily request limit reached for your plan.");
  }

  //
  // ---- 6. Check monthly limit
  //
  if (monthlyCount >= limits.monthlyRequests) {
    throw new Error(
      "Monthly request limit reached. Upgrade your plan for more scans.",
    );
  }

  // OPTIONAL CHECKS
  // ---- 1. Check file size
  //
  if (fileSizeMB && fileSizeMB > limits.maxImageSizeMB) {
    throw new Error(
      `File too large. Max file size for your plan is ${limits.maxImageSizeMB}MB.`,
    );
  }

  //
  // ---- 2. Check image resolution
  //
  if (
    (width && width > limits.maxResolution) ||
    (height && height > limits.maxResolution)
  ) {
    throw new Error(
      `Image resolution too high. Max allowed is ${limits.maxResolution}px.`,
    );
  }

  //
  // ---- 3. Check token limit per request
  //
  if (estimatedTokens && estimatedTokens > limits.maxTokensPerRequest) {
    throw new Error(
      `Document too large. This request requires ~${estimatedTokens} tokens but your plan allows only ${limits.maxTokensPerRequest}.`,
    );
  }

  return true; // allowed
}
