import { openai } from "@ai-sdk/openai";
import { tavilyExtract, tavilySearch } from "@tavily/ai-sdk";
import {
  convertToModelMessages,
  generateId,
  stepCountIs,
  ToolApprovalRequest,
  ToolContent,
  ToolLoopAgent,
  ToolResultPart,
  UIMessage,
} from "ai";
import { and, eq, sql } from "drizzle-orm";

import { formatPostTool } from "@/lib/ai/tools/shared/format-post";
import { buildGenerateImageTool } from "@/lib/ai/tools/shared/generate-image";
import { generateOutlineTool } from "@/lib/ai/tools/shared/generate-outline";
import { memoryTool } from "@/lib/ai/tools/shared/memory-tool";
import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema/agent";
import { messages as messagesTable } from "@/lib/db/schema/chat";

import { saveAgentResponse } from "../utils";

export const maxDuration = 60;

function createContentTools(teamId: string) {
  return {
    web_search: tavilySearch(),
    web_extract: tavilyExtract(),
    generate_outline: generateOutlineTool,
    format_post: formatPostTool,
    generate_image: buildGenerateImageTool(teamId),
    memory: memoryTool(teamId),
  };
}

export async function streamContentAgent(
  messages: UIMessage[],
  team: any,
  conversationId: string,
) {
  const contentTools = createContentTools(team.id);
  const today = new Date().toISOString().slice(0, 10);

  const contentAgent = new ToolLoopAgent({
    model: openai("gpt-4o"),
    tools: contentTools,
    instructions: `
      Today's date is ${today}.
      You are an Elite Content Strategist and Social Media Manager.
      
      About the Team:
      - Business: ${team.businessName || "Unknown"}
      
      Execution Workflow:
      1. If the user asks you to create content, and you don't know the topic or platform, ASK THEM before proceeding.
      2. Use 'web_search' to find facts about the requested topic if it requires up-to-date context.
      3. Use 'web_extract' to pull specific data if needed.
      4. Use 'generate_outline' to structure the post and ask the user for approval.
      5. Once approved, ALWAYS run 'format_post' to finalize the draft.
      6. If visuals are needed, use 'generate_image'.
      
      FORMATTING RULES:
      - Always format your direct responses using Markdown.
      - Never output raw HTML.
    `,
    // Fetch core memory dynamically
    prepareCall: async (settings) => {
      const coreMemoryRecord = await db.query.memories.findFirst({
        where: and(eq(memories.teamId, team.id), eq(memories.key, "core")),
      });

      const coreMemoryText = coreMemoryRecord
        ? coreMemoryRecord.content
        : "No core memory set yet.";

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
    // Debug Each step
    onStepFinish: async ({ text, response, toolCalls, toolResults }) => {
      //   console.log(`Step Response:`, response);
      //   console.log(`Tool Calls:`, toolCalls);
      // console.log(`Tool Results:`, toolResults);
      //   console.log(`Step Text:`, text);
    },
    // Custom Database Saving Logic
    onFinish: async ({ response }) => {
      await saveAgentResponse(response, { conversationId, teamId: team.id });
    },
  });

  const modelMessages = await convertToModelMessages(messages);

  // Stream directly to the user
  const result = await contentAgent.stream({
    prompt: modelMessages,
  });

  return result;
}
