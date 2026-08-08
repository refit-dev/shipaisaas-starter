import { and, eq } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { conversations, messages as messagesTable } from "@/lib/db/schema/chat";

export const GET = withAuth(async ({ req, team }) => {
  const url = new URL(req.url);
  const conversationId = url.searchParams.get("id");

  if (!conversationId) {
    return new Response("Missing conversation ID", { status: 400 });
  }

  try {
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.teamId, team.id),
      ),
      with: {
        workflowRun: {
          with: {
            workflow: {
              columns: {
                id: true,
                title: true,
              },
              with: {
                workflowSteps: {
                  columns: {
                    stepIndex: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return new Response("Conversation not found.", { status: 404 });
    }

    const history = await db.query.messages.findMany({
      where: eq(messagesTable.conversationId, conversationId),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });

    // Map the database rows perfectly back into Vercel AI SDK UIMessage objects
    const formattedMessages = history.map((msg) => {
      // Extract a fallback string for the 'content' property (required by the SDK)
      //   const textPart = msg.parts.find((p: any) => p.type === "text");

      return {
        id: msg.sdkId,
        role: msg.role as "user" | "assistant" | "system",
        parts: msg.parts,
      };
    });

    const run = conversation.workflowRun;
    const steps = run?.workflow?.workflowSteps ?? [];
    const totalSteps = steps.length;
    const currentStepDescription =
      steps.find((s) => s.stepIndex === run?.currentStepIndex)?.description ??
      null;

    return Response.json(
      {
        messages: formattedMessages,
        conversation: {
          ...conversation,
          workflowRun: run
            ? {
                ...run,
                totalSteps,
                currentStepDescription,
                // clean up the nested steps array — client doesn't need it
                workflow: run.workflow
                  ? { id: run.workflow.id, title: run.workflow.title }
                  : null,
              }
            : null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return new Response("Failed to fetch history", { status: 500 });
  }
});
