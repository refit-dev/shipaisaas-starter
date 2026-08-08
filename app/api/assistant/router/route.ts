import { generateId, UIMessage } from "ai";

// Import from our new, clean orchestrator
import { determineAgentRoute, executeAgent } from "@/lib/ai/orchestrator";
import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { conversations, messages as messagesTable } from "@/lib/db/schema/chat";
import { checkRateLimits, updateUsage } from "@/lib/utils/usage";

export const POST = withAuth(async ({ req, team, user }) => {
  const { messages, conversationId, agentId, modelId } = await req.json();
  const currentMessage = messages[messages.length - 1];

  // 1. Rate limit (fast, cached check)
  try {
    await checkRateLimits({ teamId: team.id, plan: team.planName || "free" });
  } catch (error) {
    return new Response((error as Error).message, { status: 429 });
  }

  // 2. Parallel: route + DB setup
  let activeConversationId = conversationId;

  const [{ domain, usage: routerUsage }] = await Promise.all([
    determineAgentRoute(messages, agentId),
    (async () => {
      if (!activeConversationId) {
        const textPart = currentMessage.parts?.find(
          (p: any) => p.type === "text",
        );
        const rawTitle = textPart?.text || "New Conversation";
        const [newConvo] = await db
          .insert(conversations)
          .values({
            userId: user.id,
            teamId: team.id,
            title:
              rawTitle.length > 40 ? rawTitle.slice(0, 40) + "..." : rawTitle,
            niche: "general",
          })
          .returning({ id: conversations.id });
        activeConversationId = newConvo.id;
      }

      await db.insert(messagesTable).values({
        sdkId: generateId(),
        conversationId: activeConversationId,
        role: "user",
        parts: currentMessage.parts,
      });
    })(),
  ]);

  // 3. Start the agent stream
  const agentStreamResult = await executeAgent(
    domain,
    messages.slice(-10),
    team,
    activeConversationId,
    modelId,
  );

  // 4. Fire-and-forget usage tracking
  agentStreamResult.totalUsage.then(
    ({ inputTokens, outputTokens, totalTokens }) => {
      updateUsage({
        teamId: team.id,
        inputTokens: (routerUsage?.inputTokens ?? 0) + inputTokens,
        outputTokens: (routerUsage?.outputTokens ?? 0) + outputTokens,
        totalTokens: (routerUsage?.totalTokens ?? 0) + totalTokens,
      }).catch(console.error);
    },
  );

  // 5. Return stream immediately
  return agentStreamResult.toUIMessageStreamResponse({
    headers: {
      "x-conversation-id": activeConversationId.toString(),
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
});
