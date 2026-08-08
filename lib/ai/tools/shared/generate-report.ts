import { openai } from "@ai-sdk/openai";
import { generateText, Output, tool } from "ai";
import { z } from "zod";

const REPORT_INSTRUCTIONS: Record<string, string> = {
  competitive_analysis: `
    - Start with an Executive Summary (3–5 sentences).
    - Include a comparison table (Markdown) covering the key dimensions found in the research.
    - Add a section for each competitor with strengths and weaknesses as bullet points.
    - End with a Recommendation section: which option to choose and why.
  `,
  research_summary: `
    - Start with a TL;DR (2–3 sentences).
    - Group findings into 3–5 themed sections with clear H2 headings.
    - Use bullet points for individual data points or facts.
    - End with Key Takeaways as a numbered list.
  `,
  outreach_list: `
    - Produce a Markdown table with columns: Company, Value Proposition, One-line Pitch.
    - Each row must be concise — no cell longer than 20 words.
    - After the table, add a short "How to use this list" note (2–3 sentences).
  `,
  general: `
    - Use clear H2 sections derived from the topic.
    - Lead each section with the most important point.
    - Use bullet points and tables where appropriate.
    - End with a concise Summary section.
  `,
};

export const generateReportTool = tool({
  description:
    "Generate a structured, long-form Markdown report from research or extracted content. Use this for competitive analyses, research summaries, outreach lists, or any output meant for internal use — NOT for social media posts (use format_post for those).",
  inputSchema: z.object({
    reportType: z
      .enum(["competitive_analysis", "research_summary", "outreach_list", "general"])
      .describe("The type of report to generate"),
    topic: z
      .string()
      .describe("The subject of the report, e.g. 'SaaS pricing comparison for project management tools'"),
    context: z
      .string()
      .optional()
      .describe("Any additional instructions or constraints for the report"),
  }),
  execute: async ({ reportType, topic, context }) => {
    const instructions = REPORT_INSTRUCTIONS[reportType];

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a senior analyst producing professional internal reports in Markdown.

Report type: ${reportType}
Structure rules:
${instructions}

General rules:
- Write in a clear, factual, third-person tone.
- Do not pad with filler sentences. Every sentence must add value.
- All data must come from the conversation history above — do not hallucinate facts.
${context ? `\nAdditional instructions: ${context}` : ""}`,
      prompt: `Write the report for: ${topic}`,
    });

    return { report: text, reportType, topic };
  },
});
