import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";

import { WORKFLOW_TOOL_NAMES } from "./tool-config";

// ---------------------------------------------------------------------------
// Schema
// The planner returns a strongly-typed plan. We use generateObject so the
// output is always valid JSON — no prompt-engineering the model to "respond
// only in JSON", no fragile parsing.
// ---------------------------------------------------------------------------

export const WorkflowStepSchema = z.object({
  stepIndex: z.number().int().min(0),
  description: z
    .string()
    .describe("Human-readable explanation shown in emails and the UI"),
  toolName: z.enum(WORKFLOW_TOOL_NAMES),
});

export const WorkflowPlanSchema = z.object({
  title: z.string().describe("Short title for the workflow, max 60 chars"),
  steps: z
    .array(WorkflowStepSchema)
    .min(1)
    .max(20)
    .describe("Ordered list of steps to execute"),
});

export type WorkflowPlan = z.infer<typeof WorkflowPlanSchema>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

// ---------------------------------------------------------------------------
// Planner
// A single, deterministic LLM call. Not a ToolLoopAgent — we want one shot,
// structured output, no tool calls inside the planner itself.
// ---------------------------------------------------------------------------

export async function generateWorkflowPlan(
  goal: string,
  businessName: string,
  coreMemory: string,
): Promise<WorkflowPlan> {
  const { output } = await generateText({
    model: openai("gpt-4o"),
    output: Output.object({
      schema: WorkflowPlanSchema,
    }),
    system: `
Today's date: ${new Date().toISOString().slice(0, 10)}
You are a workflow planner for a social media content team.
Your job is to break a high-level goal into a precise, ordered list of tool steps
that an automated agent will execute without further guidance.

Business: ${businessName}

--- TEAM CORE MEMORY ---
${coreMemory}
------------------------

Available tools and when to use them:
- web_search     → find current facts, news, trending topics. toolInput: { query: string }
- web_extract    → pull full content from a specific URL. toolInput: { url: string }
- generate_outline → structure the post before writing. toolInput: { topic: string, platform: string }
- generate_report → produce a structured Markdown report (competitive analysis, research summary, outreach list). Use instead of format_post when output is internal/not for publishing. toolInput: { reportType: "competitive_analysis"|"research_summary"|"outreach_list"|"general", topic: string }
- format_post    → produce the final formatted post from an outline. toolInput: { platform: string }
- generate_image → create a visual asset. toolInput: { prompt: string }
- memory         → read or update team memory. toolInput: { action: "read" | "write", key: string, content?: string }
- llm_response   → free-form assistant message, use to summarise, transition, or explain. toolInput: { prompt: string }

Rules:
1. Every content-creation workflow must include generate_outline before format_post.
2. Set requiresApproval: true on format_post and generate_image — humans should review content before it's used.
3. Set requiresApproval: false on research steps (web_search, web_extract, memory).
4. approvalPrompt is required whenever requiresApproval is true. Make it a specific question.
5. stepIndex must start at 0 and increment by 1 with no gaps.
6. toolInput must be fully static — no placeholders, no variables.
   Use the goal text to infer concrete values (topic, platform, prompt, etc.).
7. Keep the plan focused: 3–10 steps. Do not add steps that don't serve the goal.
    `,
    prompt: `Goal: ${goal}`,
  });

  return output;
}
