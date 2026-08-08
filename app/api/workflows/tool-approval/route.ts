import { generateId } from "ai";
import { Client as QStashClient } from "@upstash/qstash";
import { eq } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { workflowRuns } from "@/lib/db/schema/agent";
import { messages } from "@/lib/db/schema/chat";

const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! });
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const POST = withAuth(async ({ team, req }) => {
  const { workflowId, runId, conversationId, stepIndex, action } =
    await req.json();

  // Guard: only act on runs that are actually awaiting approval.
  const run = await db.query.workflowRuns.findFirst({
    where: eq(workflowRuns.id, runId),
  });

  if (!run) {
    return new Response("Run not found.", { status: 404 });
  }

  if (run.status !== "awaiting_approval") {
    return new Response("Run is not awaiting approval.", { status: 400 });
  }

  // Deny — stop the workflow immediately
  if (action === "reject") {
    await db
      .update(workflowRuns)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(workflowRuns.id, runId));

    await db.insert(messages).values({
      sdkId: generateId(),
      conversationId,
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Step denied. The workflow has been stopped.",
        },
      ],
    });

    return new Response("OK");
  }

  // Approve — re-enqueue the step with the user's response
  await db
    .update(workflowRuns)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(workflowRuns.id, runId));

  await qstash.publishJSON({
    url: `${APP_URL}/api/workflows/step`,
    body: {
      workflowId,
      runId,
      conversationId,
      stepIndex,
      userResponse: "Approved. Please continue.",
    },
    deduplicationId: `wf-${workflowId}-run-${runId}-step-${stepIndex}-resume-${Date.now()}`,
  });

  return new Response("OK");
});
