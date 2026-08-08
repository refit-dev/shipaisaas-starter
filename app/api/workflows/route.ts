import { and, desc, eq } from "drizzle-orm";

import { sendPlanApprovalEmail } from "@/lib/ai/workflows/emails";
import { generateWorkflowPlan } from "@/lib/ai/workflows/planner";
import { signToken } from "@/lib/ai/workflows/tokens";
import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import {
  memories,
  workflowRuns,
  workflows,
  workflowSteps,
} from "@/lib/db/schema/agent";

// ---------------------------------------------------------------------------
// POST /api/workflows
//
// Body: { goal: string, notificationEmail: string, schedule?: string }
//
// 1. Calls the planner agent → structured plan
// 2. Saves workflow + steps to DB (status = "draft")
// 3. Signs a short-lived approval token
// 4. Emails the user to review the plan
// ---------------------------------------------------------------------------

export const POST = withAuth(async ({ req, team, user }) => {
  const body = await req.json();
  const { goal, schedule } = body as {
    goal: string;
    schedule?: string;
  };

  if (!goal?.trim()) {
    return Response.json({ error: "goal is required" }, { status: 400 });
  }

  // 1. Fetch core memory to give the planner team context
  const coreMemoryRecord = await db.query.memories.findFirst({
    where: and(eq(memories.teamId, team.id), eq(memories.key, "core")),
  });
  const coreMemory = coreMemoryRecord?.content ?? "No core memory set yet.";

  // 2. Generate plan — one deterministic LLM call, structured output
  let plan;
  try {
    plan = await generateWorkflowPlan(
      goal,
      team.businessName ?? "Unknown",
      coreMemory,
    );
  } catch (err) {
    console.error("[workflows] planner failed:", err);
    return Response.json(
      { error: "Failed to generate workflow plan" },
      { status: 500 },
    );
  }

  // 3. Persist workflow + steps in a transaction
  const [workflow] = await db.transaction(async (tx) => {
    const [wf] = await tx
      .insert(workflows)
      .values({
        teamId: team.id,
        title: plan.title,
        goal,
        status: "draft", // becomes "active" after user approves
        schedule: schedule ?? null,
      })
      .returning();

    await tx.insert(workflowSteps).values(
      plan.steps.map((s) => ({
        workflowId: wf.id,
        stepIndex: s.stepIndex,
        description: s.description,
        toolName: s.toolName,
      })),
    );

    return [wf];
  });

  // 4. Sign a 24-hour approval token
  const token = await signToken(
    { type: "plan_approval", workflowId: workflow.id },
    "24h",
  );

  // 5. Send plan-approval email (non-blocking — if it fails, workflow is still saved)
  try {
    await sendPlanApprovalEmail({
      to: team.email,
      workflowId: workflow.id,
      workflowTitle: plan.title,
      goal,
      steps: plan.steps,
      token,
    });
  } catch (err) {
    console.error("[workflows] failed to send approval email:", err);
    // Don't fail the request — the user can approve from the UI too
  }

  return Response.json(
    {
      workflowId: workflow.id,
      title: plan.title,
      steps: plan.steps,
      status: "draft",
      message:
        "Plan generated. Check your email to approve and activate the workflow.",
    },
    { status: 201 },
  );
});

export const GET = withAuth(async ({ team }) => {
  try {
    const data = await db.query.workflows.findMany({
      where: eq(workflows.teamId, team.id),
      orderBy: [desc(workflows.createdAt)],
      with: {
        workflowSteps: { columns: { id: true } },
        workflowRuns: {
          orderBy: [desc(workflowRuns.runNumber)],
          limit: 1,
        },
      },
    });

    const mapped = data.map(({ workflowSteps, workflowRuns, ...wf }) => ({
      ...wf,
      stepCount: workflowSteps.length,
      latestRun: workflowRuns[0] ?? null,
    }));

    return Response.json(mapped);
  } catch (error) {
    console.error(error);
    return new Response("Failed to fetch workflows", { status: 500 });
  }
});
