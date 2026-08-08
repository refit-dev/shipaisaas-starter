import { generateId } from "ai";
import { and, eq } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { workflowRuns } from "@/lib/db/schema/agent";
import { messages as messagesTable } from "@/lib/db/schema/chat";

export const POST = withAuth(async ({ team, routeParams }) => {
  const workflowId = routeParams.id;
  const runId = parseInt(routeParams.runId);

  if (!workflowId || isNaN(runId)) {
    return new Response("Invalid ID", { status: 400 });
  }

  // Load run and verify it belongs to this team via the workflow
  const run = await db.query.workflowRuns.findFirst({
    where: eq(workflowRuns.id, runId),
    with: {
      workflow: {
        columns: { id: true, teamId: true, title: true },
      },
    },
  });

  if (!run) {
    return new Response("Run not found", { status: 404 });
  }

  // Team ownership check
  if (run.workflow.teamId !== team.id || run.workflow.id !== workflowId) {
    return new Response("Not found", { status: 404 });
  }

  // Only stoppable if currently active
  const stoppableStatuses = ["running", "awaiting_approval", "approved"];
  if (!stoppableStatuses.includes(run.status)) {
    return Response.json(
      { error: `Run is already in a terminal state: ${run.status}` },
      { status: 422 },
    );
  }

  // Mark run as failed + write a system message to the conversation
  // so the chat history reflects what happened
  await db.transaction(async (tx) => {
    await tx
      .update(workflowRuns)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(workflowRuns.id, runId));

    await tx.insert(messagesTable).values({
      sdkId: generateId(),
      conversationId: run.conversationId,
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "⏹️ This workflow run was stopped manually.",
        },
      ],
    });
  });

  return Response.json({ success: true, runId, status: "failed" });
});
