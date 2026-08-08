import { tavilyExtract, tavilySearch } from "@tavily/ai-sdk";
import { convertToModelMessages, ToolLoopAgent, UIMessage } from "ai";
import { and, eq } from "drizzle-orm";

import { resolveModel } from "@/lib/ai/models";
import { buildGenerateImageTool } from "@/lib/ai/tools/shared/generate-image";
import { formatReelTool } from "@/lib/ai/tools/shared/format-reel";
import { generateReelScriptTool } from "@/lib/ai/tools/shared/generate-reel-script";
import { memoryTool } from "@/lib/ai/tools/shared/memory-tool";
import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema/agent";

import { saveAgentResponse } from "../utils";

export const maxDuration = 60;

export async function streamReelGeneratorAgent(
  messages: UIMessage[],
  team: any,
  conversationId: string,
  modelId?: string,
) {
  const tools = {
    web_search: tavilySearch(),
    web_extract: tavilyExtract(),
    generate_reel_script: generateReelScriptTool,
    format_reel: formatReelTool,
    generate_image: buildGenerateImageTool(team.id),
    memory: memoryTool(team.id),
  };

  const today = new Date().toISOString().slice(0, 10);

  const reelAgent = new ToolLoopAgent({
    model: resolveModel(modelId),
    tools,
    instructions: `
      Today's date is ${today}.
      You are an elite Short-Form Video Content Creator specializing in viral reels.

      About the Team:
      - Business: ${team.businessName || "Unknown"}

      Execution Workflow (MANDATORY — follow in strict order, never skip steps):
      1. If you don't know the topic or target platform, ASK before proceeding.
      2. Optionally use 'web_search' to find trending hooks or relevant context for the topic.
      3. ALWAYS call 'generate_reel_script' to create the initial script structure. Present the result for user review and wait for approval.
      4. ONLY after user approval, call 'format_reel' to create the final polished content package.
      5. Optionally offer to use 'generate_image' to create a cover thumbnail using the thumbnailPrompt from the reel.

      STRICT RULES:
      - NEVER write a reel script, caption, or any structured content directly in your text response. ALL content generation MUST happen via tool calls.
      - NEVER call 'format_reel' without first having called 'generate_reel_script' in the current conversation.
      - If the user asks you to skip the script step, you MUST still call 'generate_reel_script' first.
      - Your text responses are only for: asking clarifying questions, brief status updates, or presenting tool output for user review.
    `,
    prepareCall: async (settings) => {
      const coreMemoryRecord = await db.query.memories.findFirst({
        where: and(eq(memories.teamId, team.id), eq(memories.key, "core")),
      });
      const coreMemoryText =
        coreMemoryRecord?.content ?? "No core memory set yet.";
      return {
        ...settings,
        instructions: `
          ${settings.instructions}

          --- TEAM CORE MEMORY ---
          ${coreMemoryText}
          ------------------------
        `,
      };
    },
    onStepFinish: async () => {},
    onFinish: async ({ response }) => {
      await saveAgentResponse(response, { conversationId, teamId: team.id });
    },
  });

  const modelMessages = await convertToModelMessages(messages);
  const result = await reelAgent.stream({ prompt: modelMessages });
  return result;
}
