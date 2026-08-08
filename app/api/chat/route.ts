import { generateId } from "ai";

import { streamChat } from "@/lib/ai/chat";
import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { conversations, messages as messagesTable } from "@/lib/db/schema/chat";
import { checkRateLimits, updateUsage } from "@/lib/utils/usage";

export const POST = withAuth(async ({ req, team, user }) => {
  const { messages, conversationId, modelId } = await req.json();
  const currentMessage = messages[messages.length - 1];

  // 1. Enforce the plan's request limits before spending any tokens
  try {
    await checkRateLimits({ teamId: team.id, plan: team.planName || "free" });
  } catch (error) {
    return new Response((error as Error).message, { status: 429 });
  }

  // 2. Create the conversation on first message, then store the user turn
  let activeConversationId = conversationId;

  if (!activeConversationId) {
    const textPart = currentMessage.parts?.find((p: any) => p.type === "text");
    const rawTitle = textPart?.text || "New Conversation";
    const [newConversation] = await db
      .insert(conversations)
      .values({
        userId: user.id,
        teamId: team.id,
        title: rawTitle.length > 40 ? rawTitle.slice(0, 40) + "..." : rawTitle,
      })
      .returning({ id: conversations.id });
    activeConversationId = newConversation.id;
  }

  await db.insert(messagesTable).values({
    sdkId: generateId(),
    conversationId: activeConversationId,
    role: "user",
    parts: currentMessage.parts,
  });

  // 3. Stream the answer back
  const result = await streamChat({
    messages,
    conversationId: activeConversationId,
    modelId,
    businessName: team.businessName,
  });

  // 4. Record usage once the stream completes (does not block the response)
  void (async () => {
    try {
      const { inputTokens, outputTokens, totalTokens } = await result.totalUsage;
      await updateUsage({
        teamId: team.id,
        inputTokens,
        outputTokens,
        totalTokens,
      });
    } catch (error) {
      console.error("Failed to record usage:", error);
    }
  })();

  return result.toUIMessageStreamResponse({
    headers: {
      "x-conversation-id": activeConversationId.toString(),
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
});
