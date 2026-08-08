import { eq } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { workflowSteps, workflows } from "@/lib/db/schema/agent";
import {
  WORKFLOW_TOOL_NAMES,
  WorkflowToolName,
} from "@/lib/ai/workflows/tool-config";

type DraftStep = {
  description: string;
  toolName: string;
  requiresApproval?: boolean;
  approvalPrompt?: string | null;
};

// ---------------------------------------------------------------------------
// PATCH /api/workflows/[id]/steps
//
// Atomically replaces all steps for a draft workflow.
// Body: { steps: DraftStep[] }
// ---------------------------------------------------------------------------

export const PATCH = withAuth(async ({ req, team, routeParams }) => {
  const workflowId = routeParams.id;

  const workflow = await db.query.workflows.findFirst({
    where: eq(workflows.id, workflowId),
  });

  if (!workflow || workflow.teamId !== team.id) {
    return new Response("Not found", { status: 404 });
  }
  if (workflow.status !== "draft") {
    return Response.json(
      { error: "Only draft workflows can be edited" },
      { status: 422 },
    );
  }

  let steps: DraftStep[];
  try {
    const body = await req.json();
    steps = body.steps;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    return Response.json(
      { error: "steps must be a non-empty array" },
      { status: 400 },
    );
  }

  for (const s of steps) {
    if (!WORKFLOW_TOOL_NAMES.includes(s.toolName as WorkflowToolName)) {
      return Response.json(
        { error: `Unknown tool: ${s.toolName}` },
        { status: 400 },
      );
    }
    if (!s.description?.trim()) {
      return Response.json(
        { error: "Each step requires a non-empty description" },
        { status: 400 },
      );
    }
  }

  const updated = await db.transaction(async (tx) => {
    await tx
      .delete(workflowSteps)
      .where(eq(workflowSteps.workflowId, workflowId));

    const inserted = await tx
      .insert(workflowSteps)
      .values(
        steps.map((s, i) => ({
          workflowId,
          stepIndex: i,
          description: s.description.trim(),
          toolName: s.toolName,
          requiresApproval: s.requiresApproval ?? false,
          approvalPrompt: s.approvalPrompt ?? null,
        })),
      )
      .returning();

    return inserted;
  });

  return Response.json(updated);
});
