import { Client } from "@upstash/qstash";
import { eq } from "drizzle-orm";

import { verifyToken } from "@/lib/ai/workflows/tokens";
import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { workflowRuns, workflows } from "@/lib/db/schema/agent";
import { conversations } from "@/lib/db/schema/chat";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Shared activation logic — flips workflow to active, creates run #1, enqueues step 0
// ---------------------------------------------------------------------------

async function activateWorkflow(workflowId: string) {
  const workflow = await db.query.workflows.findFirst({
    where: eq(workflows.id, workflowId),
  });

  if (!workflow) return { found: false } as const;
  if (workflow.status === "active") return { found: true, alreadyActive: true, workflow } as const;

  const { conversation, run } = await db.transaction(async (tx) => {
    await tx
      .update(workflows)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(workflows.id, workflowId));

    const [conv] = await tx
      .insert(conversations)
      .values({
        teamId: workflow.teamId,
        title: `${workflow.title} — Run #1`,
        niche: "workflow",
        workflowId: workflow.id,
      })
      .returning();

    const [wfRun] = await tx
      .insert(workflowRuns)
      .values({
        workflowId: workflow.id,
        conversationId: conv.id,
        runNumber: 1,
        status: "approved",
      })
      .returning();

    return { conversation: conv, run: wfRun };
  });

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

  return { found: true, alreadyActive: false, workflow, conversation, run } as const;
}

// ---------------------------------------------------------------------------
// GET /api/workflows/[id]/approve?token=...
// Called from email links — verifies JWT then activates + redirects
// ---------------------------------------------------------------------------

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const workflowId = id;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    return new Response("Invalid or expired token", { status: 401 });
  }

  if (payload.type !== "plan_approval" || payload.workflowId !== workflowId) {
    return new Response("Token mismatch", { status: 401 });
  }

  const result = await activateWorkflow(workflowId);

  if (!result.found) {
    return new Response("Workflow not found", { status: 404 });
  }

  return Response.redirect(
    `${APP_URL}/dashboard/workflows/${workflowId}`,
    302,
  );
}

// ---------------------------------------------------------------------------
// POST /api/workflows/[id]/approve
// Called from the UI — auth-gated, no token required
// ---------------------------------------------------------------------------

export const POST = withAuth(async ({ team, routeParams }) => {
  const workflowId = routeParams.id;

  const workflow = await db.query.workflows.findFirst({
    where: eq(workflows.id, workflowId),
  });

  if (!workflow || workflow.teamId !== team.id) {
    return new Response("Not found", { status: 404 });
  }
  if (workflow.status !== "draft") {
    return Response.json(
      { error: "Only draft workflows can be approved" },
      { status: 422 },
    );
  }

  const result = await activateWorkflow(workflowId);

  if (!result.found) {
    return new Response("Workflow not found", { status: 404 });
  }

  return Response.json({ success: true });
});
