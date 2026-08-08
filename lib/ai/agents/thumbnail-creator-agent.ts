import { convertToModelMessages, ToolLoopAgent, UIMessage } from "ai";
import { and, eq } from "drizzle-orm";

import { resolveModel } from "@/lib/ai/models";
import { buildGenerateImageTool } from "@/lib/ai/tools/shared/generate-image";
import { generateThumbnailConceptTool } from "@/lib/ai/tools/shared/generate-thumbnail-concept";
import { memoryTool } from "@/lib/ai/tools/shared/memory-tool";
import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema/agent";

import { saveAgentResponse } from "../utils";

export const maxDuration = 60;

export async function streamThumbnailCreatorAgent(
  messages: UIMessage[],
  team: any,
  conversationId: string,
  modelId?: string,
) {
  const tools = {
    generate_thumbnail_concept: generateThumbnailConceptTool,
    generate_image: buildGenerateImageTool(team.id),
    memory: memoryTool(team.id),
  };

  const thumbnailAgent = new ToolLoopAgent({
    model: resolveModel(modelId),
    tools,
    instructions: `
      You are an expert Thumbnail Designer specializing in high-CTR thumbnail creation.

      About the Team:
      - Business: ${team.businessName || "Unknown"}

      Execution Workflow:
      1. Ask for the topic, platform (YouTube, Blog, or Social), and any style preferences if not provided.
      2. Use 'generate_thumbnail_concept' to create 3 distinct design concepts.
      3. Present all 3 concepts clearly with their color schemes, text overlays, and composition descriptions.
      4. Ask the user which concept they would like to generate.
      5. Once the user selects a concept, use 'generate_image' with that concept's imagePrompt.

      FORMATTING RULES:
      - Always format your direct responses using Markdown.
      - Present concepts as a numbered list with clear visual descriptions and their color palettes.
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
  const result = await thumbnailAgent.stream({ prompt: modelMessages });
  return result;
}
