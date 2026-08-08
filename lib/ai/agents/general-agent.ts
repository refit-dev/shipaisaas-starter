import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, generateId, streamText, UIMessage } from "ai";

import { db } from "@/lib/db";
import { messages as messagesTable } from "@/lib/db/schema/chat";
import { mapCoreToUIParts } from "@/lib/utils/chat";

// Standard duration since it doesn't need to wait for external APIs
export const maxDuration = 30;

export async function streamGeneralAgent(
  messages: UIMessage[],
  team: any,
  conversationId: string,
) {
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: await convertToModelMessages(messages),
    system: `
You are a smart AI assistant and the "front door" for a powerful Content Engine SaaS.
Your purpose is to be helpful, friendly, and to guide the user on how to use the platform.

When a user asks what you can do, or asks for help, explain your main capabilities.
These capabilities are handled by your specialized background agents:

- ✍️ **Content Creation**: "I can write blog posts, LinkedIn updates, Twitter threads, and SEO articles."
- 🔍 **Web Research**: "I can search the web for the latest news, trends, and competitor data to ground your content."
- 🎨 **Image Generation**: "I can generate custom images and thumbnails to accompany your posts."

Your tone should be professional, creative, and encouraging. Use emojis to make it approachable.

🚨 IMPORTANT RULE 🚨:
You DO NOT have access to the research or writing tools yourself. 
If the user asks you to "write a post" or "search the web" in this conversation turn, DO NOT try to fulfill the request directly. 
Instead, enthusiastically acknowledge the request and tell them to provide the specific topic so your specialized agents can take over on the next message. 
(e.g., "I'd love to write that for you! Just tell me a bit more about the specific topic or angle, and I'll get right on it.")

About the User's Team:
- Business name: ${team?.businessName || "your business"}
- Goal: Help them scale their brand presence effortlessly.
Time Context: We are in ${new Date().getFullYear()}
`,
    onFinish: async ({ response }) => {
      // response.messages contains the final structured parts from the assistant
      // including tool calls, results, and text responses.
      const assistantMessage = response.messages[response.messages.length - 1];
      // Generate the type-safe parts array
      const safeParts = mapCoreToUIParts(assistantMessage.content);

      if (assistantMessage) {
        // Fire and forget DB saving
        db.insert(messagesTable)
          .values({
            sdkId: generateId(), // Create a unique ID for the DB
            conversationId: conversationId,
            role: "assistant",
            // The SDK response parts map perfectly to your jsonb parts schema
            parts: safeParts,
          })
          .catch((err) =>
            console.error("Failed to save assistant message:", err),
          );
      }
    },
  });

  return result;
}
