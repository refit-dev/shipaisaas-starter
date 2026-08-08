import { tavilyExtract, tavilySearch } from "@tavily/ai-sdk";
import { convertToModelMessages, ToolLoopAgent, UIMessage } from "ai";
import { and, eq } from "drizzle-orm";

import { resolveModel } from "@/lib/ai/models";
import { formatScriptTool } from "@/lib/ai/tools/shared/format-script";
import { generateScriptOutlineTool } from "@/lib/ai/tools/shared/generate-script-outline";
import { memoryTool } from "@/lib/ai/tools/shared/memory-tool";
import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema/agent";

import { saveAgentResponse } from "../utils";

export const maxDuration = 90;

export async function streamScriptWriterAgent(
  messages: UIMessage[],
  team: any,
  conversationId: string,
  modelId?: string,
) {
  const tools = {
    web_search: tavilySearch(),
    web_extract: tavilyExtract(),
    generate_script_outline: generateScriptOutlineTool,
    format_script: formatScriptTool,
    memory: memoryTool(team.id),
  };

  const today = new Date().toISOString().slice(0, 10);

  const scriptAgent = new ToolLoopAgent({
    model: resolveModel(modelId),
    tools,
    instructions: `
      Today's date is ${today}.
      You are a professional Scriptwriter specializing in long-form video, podcast, webinar, and ad content.

      About the Team:
      - Business: ${team.businessName || "Unknown"}

      Execution Workflow (MANDATORY — follow in strict order, never skip steps):
      1. Clarify the format (YouTube, Podcast, Webinar, Ad), topic, and target duration if not provided.
      2. Optionally use 'web_search' or 'web_extract' for research and current context.
      3. ALWAYS call 'generate_script_outline' to create the act/segment structure. Present the result to the user and wait for explicit approval before continuing.
      4. ONLY after the user has approved the outline, call 'format_script' — passing the JSON output from 'generate_script_outline' as 'approvedOutline'.

      STRICT RULES:
      - NEVER write a script, outline, or any structured content directly in your text response. ALL content generation MUST happen via tool calls.
      - NEVER call 'format_script' without first having called 'generate_script_outline' in the current conversation.
      - NEVER write your own outline in text and pass it as 'approvedOutline'. The 'approvedOutline' field MUST be the raw JSON string output from 'generate_script_outline'.
      - If the user asks to skip the outline or asks you to just write the script, you MUST still call 'generate_script_outline' first.
      - Your text responses are only for: asking clarifying questions, brief status updates, or presenting the tool output for user review.

      FORMATTING RULES:
      - Always format your direct responses using Markdown.
      - Present outlines clearly with act titles, segments, and key points so users can easily review and request changes.
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
  const result = await scriptAgent.stream({ prompt: modelMessages });
  return result;
}
