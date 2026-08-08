import { tavilyExtract, tavilySearch } from "@tavily/ai-sdk";

import { formatPostTool } from "@/lib/ai/tools/shared/format-post";
import { buildGenerateImageTool } from "@/lib/ai/tools/shared/generate-image";
import { generateOutlineTool } from "@/lib/ai/tools/shared/generate-outline";
import { generateReportTool } from "@/lib/ai/tools/shared/generate-report";
import { memoryTool } from "@/lib/ai/tools/shared/memory-tool";

// ---------------------------------------------------------------------------
// buildAllTools
//
// Returns the full tool registry — the same map as createContentTools() in
// the chat agent. The step executor picks ONE tool from this map per step
// and gives it to a ToolLoopAgent with stopWhen: stepCountIs(1).
//
// The agent sees the full conversation history and infers the correct inputs
// itself — no static toolInput needed. This also means chained steps work
// naturally: format_post sees the outline from the previous step in history.
//
// needsApproval is read directly off each tool object — single source of truth.
// ---------------------------------------------------------------------------

export function buildAllTools(teamId: string) {
  return {
    web_search: tavilySearch(),
    web_extract: tavilyExtract(),
    generate_outline: generateOutlineTool,
    generate_report: generateReportTool,
    format_post: formatPostTool,
    generate_image: buildGenerateImageTool(teamId),
    memory: memoryTool(teamId),
  };
}

export type AllTools = ReturnType<typeof buildAllTools>;
export type StepToolName = keyof AllTools;
