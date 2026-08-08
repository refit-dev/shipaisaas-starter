import { generateId } from "ai";
import { Client as QStashClient } from "@upstash/qstash";
import { eq } from "drizzle-orm";

import { verifyToken } from "@/lib/ai/workflows/tokens";
import { db } from "@/lib/db";
import { workflowRuns } from "@/lib/db/schema/agent";
import { messages } from "@/lib/db/schema/chat";

const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! });
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// GET /api/workflows/resume?token=...&action=approve|reject&note=...
//
// Called when the user clicks Approve or Request changes in a step-approval
// email. Re-enqueues the step executor via QStash with the user's response
// attached, which the step executor saves as a user message before re-running
// the agent.
//
// Bot-prefetch guard: email scanners send GET requests with no User-Agent or
// with known scanner strings. We check for a recognisable browser UA before
// doing anything destructive. This is not a security measure — the token is
// the security. It just prevents accidental execution from link previews.
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  // ------------------------------------------------------------------
  // Bot-prefetch guard
  // ------------------------------------------------------------------
  const ua = req.headers.get("user-agent") ?? "";
  const isBotLike =
    !ua ||
    /bot|crawl|spider|preview|scan|slack|telegram|whatsapp|facebook|twitter|linkedin|google|bing|yahoo|DuckDuck|curl|python|java|Go-http/i.test(
      ua,
    );

  if (isBotLike) {
    // Return a neutral 200 with no side effects — bots see nothing useful
    return new Response("OK", { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action") as "approve" | "reject" | null;
  const note = searchParams.get("note") ?? undefined;

  // ------------------------------------------------------------------
  // Basic validation
  // ------------------------------------------------------------------
  if (!token) {
    return redirectToError("Missing token.");
  }
  if (action !== "approve" && action !== "reject") {
    return redirectToError("Invalid action.");
  }

  // ------------------------------------------------------------------
  // Verify token
  // ------------------------------------------------------------------
  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    return redirectToError("This link has expired or is invalid.");
  }

  if (payload.type !== "step_approval") {
    return redirectToError("Wrong token type.");
  }

  const { workflowId, runId, conversationId, stepIndex } = payload;

  // ------------------------------------------------------------------
  // Guard: only act on runs that are actually awaiting approval.
  // Prevents double-clicks from processing the same approval twice.
  // ------------------------------------------------------------------
  const run = await db.query.workflowRuns.findFirst({
    where: eq(workflowRuns.id, runId),
  });

  if (!run) {
    return redirectToError("Run not found.");
  }

  if (run.status !== "awaiting_approval") {
    // Already handled — just send them to the conversation
    return Response.redirect(
      `${APP_URL}/dashboard/workflows/${workflowId}`,
      302,
    );
  }

  // ------------------------------------------------------------------
  // Deny — stop the workflow immediately
  // ------------------------------------------------------------------
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

    return Response.redirect(`${APP_URL}/dashboard/workflows/${workflowId}`, 302);
  }

  // ------------------------------------------------------------------
  // Approve — re-enqueue the step with the user's response
  // ------------------------------------------------------------------
  const userResponse = note
    ? `Approved with note: ${note}`
    : "Approved. Please continue.";

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
      userResponse,
    },
    deduplicationId: `wf-${workflowId}-run-${runId}-step-${stepIndex}-resume-${Date.now()}`,
  });

  return Response.redirect(`${APP_URL}/dashboard/workflows/${workflowId}`, 302);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function redirectToError(message: string) {
  const url = new URL(`${APP_URL}/error`);
  url.searchParams.set("message", message);
  return Response.redirect(url.toString(), 302);
}
