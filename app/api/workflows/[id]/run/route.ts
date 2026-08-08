import { Client as QStashClient } from "@upstash/qstash";
import { and, count, eq } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { workflowRuns, workflows } from "@/lib/db/schema/agent";
import { conversations } from "@/lib/db/schema/chat";
import { checkRateLimits } from "@/lib/utils/usage";

const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! });
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const POST = withAuth(async ({ team, routeParams }) => {
  const workflowId = routeParams.id;

  if (!workflowId) {
    return new Response("Invalid ID", { status: 400 });
  }

  // 1. Load workflow — must belong to this team and be active
  const workflow = await db.query.workflows.findFirst({
    where: and(eq(workflows.id, workflowId), eq(workflows.teamId, team.id)),
  });

  if (!workflow) {
    return new Response("Workflow not found", { status: 404 });
  }
  if (workflow.status !== "active") {
    return Response.json(
      {
        error:
          "Workflow must be active before it can be run. Approve the plan first.",
      },
      { status: 422 },
    );
  }

  // 2. Guard: don't start a new run if one is already in progress
  const activeRun = await db.query.workflowRuns.findFirst({
    where: and(
      eq(workflowRuns.workflowId, workflowId),
      // running or awaiting_approval both count as in-progress
      // Drizzle doesn't have inArray on enums easily so we check separately
    ),
    columns: { id: true, status: true, conversationId: true },
  });

  if (
    activeRun &&
    (activeRun.status === "running" ||
      activeRun.status === "awaiting_approval" ||
      activeRun.status === "approved")
  ) {
    return Response.json(
      {
        error: "A run is already in progress.",
        conversationId: activeRun.conversationId,
      },
      { status: 409 },
    );
  }

  // 3. Check rate limits before starting the run
  try {
    await checkRateLimits({ teamId: team.id, plan: team.planName });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Rate limit exceeded." },
      { status: 429 },
    );
  }

  // 5. Derive next run number
  const [{ value: runCount }] = await db
    .select({ value: count() })
    .from(workflowRuns)
    .where(eq(workflowRuns.workflowId, workflowId));

  const nextRunNumber = (runCount ?? 0) + 1;

  // 6. Create conversation + run in a transaction
  const { conversation, run } = await db.transaction(async (tx) => {
    const [conv] = await tx
      .insert(conversations)
      .values({
        teamId: workflow.teamId,
        title: `${workflow.title} — Run #${nextRunNumber}`,
        niche: "workflow",
        workflowId: workflow.id,
      })
      .returning();

    const [wfRun] = await tx
      .insert(workflowRuns)
      .values({
        workflowId: workflow.id,
        conversationId: conv.id,
        runNumber: nextRunNumber,
        status: "running",
        currentStepIndex: 0,
      })
      .returning();

    return { conversation: conv, run: wfRun };
  });

  // 7. Enqueue step 0
  await qstash.publishJSON({
    url: `${APP_URL}/api/workflows/step`,
    body: {
      workflowId: workflow.id,
      runId: run.id,
      conversationId: conversation.id,
      stepIndex: 0,
    },
    deduplicationId: `wf-${workflow.id}-run-${run.id}-step-0`,
    delay: 2,
  });

  return Response.json({
    runId: run.id,
    runNumber: nextRunNumber,
    conversationId: conversation.id,
  });
});
