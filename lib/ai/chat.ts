import { convertToModelMessages, generateId, streamText, UIMessage } from "ai";

import { aiConfig, buildSystemPrompt } from "@/config/ai";
import { resolveModel } from "@/lib/ai/models";
import { db } from "@/lib/db";
import { messages as messagesTable } from "@/lib/db/schema/chat";
import { mapCoreToUIParts } from "@/lib/utils/chat";

// Streaming text responses finish well inside the default serverless window.
export const maxDuration = 30;

type StreamChatOptions = {
  messages: UIMessage[];
  conversationId: string;
  /** Model id from SUPPORTED_MODELS; falls back to the default model. */
  modelId?: string;
  /** Used to personalise the system prompt. */
  businessName?: string | null;
};

/**
 * The single entry point for chat completions.
 *
 * Streams the model response back to the client and persists the finished
 * assistant message to the `messages` table so the conversation can be
 * replayed later.
 */
export async function streamChat({
  messages,
  conversationId,
  modelId,
  businessName,
}: StreamChatOptions) {
  const modelMessages = await convertToModelMessages(
    messages.slice(-aiConfig.historyWindow),
  );

  return streamText({
    model: resolveModel(modelId),
    temperature: aiConfig.temperature,
    system: buildSystemPrompt(businessName),
    messages: modelMessages,
    onFinish: async ({ response }) => {
      const assistantMessage = response.messages[response.messages.length - 1];
      if (!assistantMessage) return;

      try {
        await db.insert(messagesTable).values({
          sdkId: generateId(),
          conversationId,
          role: "assistant",
          parts: mapCoreToUIParts(assistantMessage.content),
        });
      } catch (error) {
        console.error("Failed to save assistant message:", error);
      }
    },
  });
}
