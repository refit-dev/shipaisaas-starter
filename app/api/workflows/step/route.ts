import { openai } from "@ai-sdk/openai";
import { Client as QStashClient } from "@upstash/qstash";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import {
  convertToModelMessages,
  generateId,
  stepCountIs,
  ToolApprovalResponse,
  ToolLoopAgent,
} from "ai";
import { and, asc, eq, sql } from "drizzle-orm";

import { saveAgentResponse } from "@/lib/ai/utils";
import {
  sendRunCompletedEmail,
  sendRunFailedEmail,
  sendStepApprovalEmail,
} from "@/lib/ai/workflows/emails";
import { signToken } from "@/lib/ai/workflows/tokens";
import { buildAllTools, StepToolName } from "@/lib/ai/workflows/tools";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema/account";
import { workflowRuns, workflows, workflowSteps } from "@/lib/db/schema/agent";
import { messages as messagesTable } from "@/lib/db/schema/chat";
import { checkRateLimits, updateUsage } from "@/lib/utils/usage";

const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! });
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StepPayload {
  workflowId: string;
  runId: number;
  conversationId: string;
  stepIndex: number;
  userResponse?: string; // present when resuming after a human approval
}

// ---------------------------------------------------------------------------
// POST /api/workflows/step
//
// Called by QStash for every step. One ToolLoopAgent invocation per step,
// constrained to the single tool defined in the plan. The agent sees the full
// conversation history so it can infer inputs from prior step outputs.
//
// Flow:
//   1. Load context (workflow, step, run, conversation history)
//   2. Save userResponse as a user message if resuming after approval
//   3. Run ToolLoopAgent with only this step's tool, stopWhen: stepCountIs(1)
//   4. Save agent response to messages immediately (same shape as chat UI)
//   5a. tool.needsApproval  → pause, send email, stop
//   5b. more steps          → enqueue next step
//   5c. done                → mark completed, send email
// ---------------------------------------------------------------------------

async function handler(req: Request): Promise<Response> {
  const body = (await req.json()) as StepPayload;
  const { workflowId, runId, conversationId, stepIndex, userResponse } = body;

  // ------------------------------------------------------------------
  // 1. Load context
  // ------------------------------------------------------------------
  const [workflow, step, run, existingMessages] = await Promise.all([
    db.query.workflows.findFirst({
      where: eq(workflows.id, workflowId),
    }),
    db.query.workflowSteps.findFirst({
      where: and(
        eq(workflowSteps.workflowId, workflowId),
        eq(workflowSteps.stepIndex, stepIndex),
      ),
    }),
    db.query.workflowRuns.findFirst({
      where: eq(workflowRuns.id, runId),
    }),
    db.query.messages.findMany({
      where: eq(messagesTable.conversationId, conversationId),
      orderBy: asc(messagesTable.createdAt),
    }),
  ]);

  if (!workflow || !step || !run) {
    console.error("[step] missing context", { workflowId, runId, stepIndex });
    return new Response("Context not found", { status: 404 });
  }

  // get team
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, workflow.teamId),
  });

  if (!team) {
    console.error("[step] team not found", { teamId: workflow.teamId });
    return new Response("Team not found", { status: 404 });
  }

  if (run.status === "completed" || run.status === "failed") {
    return new Response("Run already finished", { status: 200 });
  }

  // ------------------------------------------------------------------
  // 2. Save userResponse before running the agent so it appears in history
  // ------------------------------------------------------------------
  if (userResponse) {
    await db.insert(messagesTable).values({
      sdkId: generateId(),
      conversationId,
      role: "user",
      parts: [{ type: "text", text: userResponse }],
    });
  }

  // ------------------------------------------------------------------
  // 3. Build conversation history for the agent.
  //    Reload messages if we just inserted a userResponse.
  // ------------------------------------------------------------------
  const historyRows = userResponse
    ? await db.query.messages.findMany({
        where: eq(messagesTable.conversationId, conversationId),
        orderBy: asc(messagesTable.createdAt),
      })
    : existingMessages;

  // Convert DB rows → UIMessage shape the SDK expects
  const uiMessages = historyRows.map((row) => ({
    id: row.sdkId,
    role: row.role as "user" | "assistant",
    parts: row.parts as any[],
  }));

  // ------------------------------------------------------------------
  // 4. Run ToolLoopAgent with only this step's tool
  // ------------------------------------------------------------------
  const allTools = buildAllTools(workflow.teamId);
  const isLlmStep = step.toolName === "llm_response";

  // For llm_response steps: no tools, agent just generates a text reply.
  // For all other steps: one tool, one call, then stop.
  const stepTool = isLlmStep
    ? undefined
    : allTools[step.toolName as StepToolName];

  if (!isLlmStep && !stepTool) {
    return new Response(`Unknown tool: ${step.toolName}`, { status: 400 });
  }

  let agentResponse: any;
  //   let toolNeedsApproval = false;

  try {
    await checkRateLimits({
      teamId: workflow.teamId,
      plan: team.planName || "Free",
    });

    const agent = new ToolLoopAgent({
      model: openai("gpt-4o"),
      // Constrain to exactly one tool call then stop.
      // For llm_response steps this has no effect (no tools).
      stopWhen: stepCountIs(1),
      tools: isLlmStep ? {} : { [step.toolName]: stepTool! },
      instructions: `
        You are an automated workflow agent executing a pre-planned step.
        Today's date is ${new Date().toISOString().slice(0, 10)}.
        Business: ${workflow.teamId}

        Current step: "${step.description}"
        ${isLlmStep ? "Write a clear, helpful response using the conversation history above." : `You must call the '${step.toolName}' tool. Use the conversation history to determine the correct inputs.`}

        Do not ask clarifying questions. Do not deviate from the step. Execute it.
      `,
    });

    const modelMessages = await convertToModelMessages(uiMessages);

    if (run.status === "approved") {
      // Add tool approval message
      // Find the tool approval request in the history and convert it to a tool approval response
      const approvals: ToolApprovalResponse[] = [];
      for (const msg of uiMessages) {
        if (msg.role === "assistant") {
          for (const part of msg.parts as any[]) {
            if (part.state === "approval-requested" && part.approval) {
              const approvalResponse: ToolApprovalResponse = {
                type: "tool-approval-response",
                approvalId: part.approval.id,
                approved: true,
                reason: "Approved by user",
              };
              approvals.push(approvalResponse);
            }
          }
        }
      }

      // add approvals to messages
      modelMessages.push({ role: "tool", content: approvals });
    }

    if (modelMessages.length === 0) {
      // Ensure there's at least one message for the agent to avoid errors
      modelMessages.push({ role: "system", content: "No prior messages." });
    }

    const result = await agent.generate({
      // Pass full conversation history — agent uses prior outputs as inputs
      prompt: modelMessages,
    });

    agentResponse = result.response;

    await updateUsage({
      teamId: workflow.teamId,
      inputTokens: result.usage?.inputTokens ?? 0,
      outputTokens: result.usage?.outputTokens ?? 0,
      totalTokens: result.usage?.totalTokens ?? 0,
      credits: 1,
    }).catch(console.error);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`[step] agent failed at step ${stepIndex}:`, error);

    await db.insert(messagesTable).values({
      sdkId: generateId(),
      conversationId,
      role: "assistant",
      parts: [
        {
          type: "text",
          text: `⚠️ Step failed: **${step.description}**\n\n\`\`\`\n${error}\n\`\`\``,
        },
      ],
    });

    await db
      .update(workflowRuns)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(workflowRuns.id, runId));

    await sendRunFailedEmail({
      to: team.email,
      workflowTitle: workflow.title,
      workflowId: workflow.id,
      runNumber: run.runNumber,
      stepDescription: step.description,
      error,
    }).catch(console.error);

    // 200 so QStash doesn't retry a permanent failure
    return new Response("Step failed — run marked as failed", { status: 200 });
  }

  // ------------------------------------------------------------------
  // 5. Save agent response immediately — same shape as chat UI
  // ------------------------------------------------------------------
  const toolNeedsApproval = await saveAgentResponse(agentResponse, {
    conversationId,
    teamId: workflow.teamId,
    runId,
  });

  // ------------------------------------------------------------------
  // 6. Decide what comes next
  // ------------------------------------------------------------------
  const nextStep = await db.query.workflowSteps.findFirst({
    where: and(
      eq(workflowSteps.workflowId, workflowId),
      eq(workflowSteps.stepIndex, stepIndex + 1),
    ),
  });

  // 6a. Tool requires human approval — pause, email, stop
  if (toolNeedsApproval) {
    await db
      .update(workflowRuns)
      .set({
        status: "awaiting_approval",
        currentStepIndex: stepIndex,
        updatedAt: new Date(),
      })
      .where(eq(workflowRuns.id, runId));

    // Extract a readable preview of what the tool produced
    const toolOutputPreview = agentResponse.messages
      .filter((m: any) => m.role === "tool")
      .flatMap((m: any) => (Array.isArray(m.content) ? m.content : []))
      .filter((c: any) => c.type === "tool-result")
      .map((c: any) =>
        typeof c.output === "string"
          ? c.output
          : JSON.stringify(c.output, null, 2),
      )
      .join("\n\n");

    const token = await signToken(
      { type: "step_approval", workflowId, runId, conversationId, stepIndex },
      "2h",
    );

    await sendStepApprovalEmail({
      to: team.email,
      workflowId,
      runNumber: run.runNumber,
      conversationId,
      workflowTitle: workflow.title,
      stepDescription: step.description,
      approvalPrompt: step.approvalPrompt ?? "Does this output look good?",
      toolOutput: toolOutputPreview || "(no preview available)",
      token,
    }).catch(console.error);

    return new Response("Paused — awaiting human approval", { status: 200 });
  }

  // 6b. More steps — enqueue next
  if (nextStep) {
    await db
      .update(workflowRuns)
      .set({
        status: "running",
        currentStepIndex: stepIndex + 1,
        updatedAt: new Date(),
      })
      .where(eq(workflowRuns.id, runId));

    await qstash.publishJSON({
      url: `${APP_URL}/api/workflows/step`,
      body: { workflowId, runId, conversationId, stepIndex: stepIndex + 1 },
      deduplicationId: `wf-${workflowId}-run-${runId}-step-${stepIndex + 1}`,
    });

    return new Response("Step done — next step enqueued", { status: 200 });
  }

  // 6c. All done
  await db
    .update(workflowRuns)
    .set({
      status: "completed",
      currentStepIndex: stepIndex,
      updatedAt: new Date(),
    })
    .where(eq(workflowRuns.id, runId));

  await sendRunCompletedEmail({
    to: team.email,
    workflowTitle: workflow.title,
    workflowId: workflow.id,
    runNumber: run.runNumber,
  }).catch(console.error);

  return new Response("Run completed", { status: 200 });
}

export const POST = verifySignatureAppRouter(handler);
