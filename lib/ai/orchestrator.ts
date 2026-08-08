import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  generateText,
  Output,
  StreamTextResult,
  UIMessage,
} from "ai";
import { z } from "zod";

import { streamContentAgent } from "@/lib/ai/agents/content-agent";
import { streamGeneralAgent } from "@/lib/ai/agents/general-agent";
import { streamLegalAnalyzerAgent } from "@/lib/ai/agents/legal-analyzer-agent";
import { streamReceiptScannerAgent } from "@/lib/ai/agents/receipt-scanner-agent";
import { streamReelGeneratorAgent } from "@/lib/ai/agents/reel-generator-agent";
import { streamScriptWriterAgent } from "@/lib/ai/agents/script-writer-agent";
import { streamThumbnailCreatorAgent } from "@/lib/ai/agents/thumbnail-creator-agent";
import { AGENT_REGISTRY, AgentId } from "@/lib/ai/agents/registry";

// 2. The Semantic Router
export async function determineAgentRoute(
  messages: UIMessage[],
  requestedAgentId?: string,
): Promise<{ domain: AgentId; usage: any }> {
  // If the frontend forces an agent, bypass the LLM router to save tokens/time
  if (
    requestedAgentId &&
    requestedAgentId !== "general" &&
    // Object.keys(AGENT_REGISTRY).includes(requestedAgentId) // This is incorrect, need to check against agent id if its equal to the requestedAgentId, not the key in the registry
    Object.values(AGENT_REGISTRY).some((agent) => agent.id === requestedAgentId)
  ) {
    return { domain: requestedAgentId as AgentId, usage: null };
  }

  // Otherwise, let gpt-4o-mini figure it out
  const routingKeys = Object.keys(AGENT_REGISTRY) as [string, ...string[]];
  // Date context
  const today = new Date().toISOString().slice(0, 10);

  const result = await generateText({
    model: openai("gpt-4o-mini"),
    temperature: 0,
    messages: await convertToModelMessages(messages),
    system: `
      You are the core Orchestrator Router. Your ONLY job is to analyze the user's message and determine the domain.
      Today's date is ${today}.
      Domains:
        ${Object.entries(AGENT_REGISTRY)
          .map(([key, meta]) => `- ${key}: ${meta.description}`)
          .join("\n")}

      Return the chosen domain.
    `,
    output: Output.object({
      schema: z.object({
        domain: z.enum(routingKeys),
      }),
    }),
  });

  return {
    domain: result.output.domain as AgentId,
    usage: result.totalUsage,
  };
}

// 3. The Dispatcher
export async function executeAgent(
  domain: AgentId,
  messages: UIMessage[],
  team: any,
  conversationId: string,
  modelId?: string,
): Promise<StreamTextResult<any, any>> {
  switch (domain) {
    case "content-creation":
      return await streamContentAgent(messages, team, conversationId);
    case "reel-generator":
      return await streamReelGeneratorAgent(
        messages,
        team,
        conversationId,
        modelId,
      );
    case "script-writer":
      return await streamScriptWriterAgent(
        messages,
        team,
        conversationId,
        modelId,
      );
    case "thumbnail-creator":
      return await streamThumbnailCreatorAgent(
        messages,
        team,
        conversationId,
        modelId,
      );
    case "receipt-scanner":
      return await streamReceiptScannerAgent(
        messages,
        team,
        conversationId,
        modelId,
      );
    case "legal-analyzer":
      return await streamLegalAnalyzerAgent(
        messages,
        team,
        conversationId,
        modelId,
      );
    case "general":
    default:
      return await streamGeneralAgent(messages, team, conversationId);
  }
}
