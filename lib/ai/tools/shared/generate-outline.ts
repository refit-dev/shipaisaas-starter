import { openai } from "@ai-sdk/openai";
import { generateText, Output, tool } from "ai";
import { z } from "zod";

export const generateOutlineTool = tool({
  description:
    "Always use this tool to generate a structured outline BEFORE drafting any long-form content, blog posts, or social media threads.",
  inputSchema: z.object({
    topic: z.string().describe("The main subject or thesis of the content"),
    platform: z
      .enum([
        "LinkedIn",
        "Twitter",
        "Blog",
        "Instagram",
        "Facebook",
        "Newsletter",
      ])
      .describe("The target platform"),
  }),
  execute: async ({ topic, platform }) => {
    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"), // Fast and cheap for structural tasks
        system: `You are an expert content strategist and technical writer.
Your task is to create a structured outline for content given a topic and a platform.

Rules for content:
- Create 3–5 sections per outline
- Each section must have 2–4 concise, actionable points
- Points must be specific and relevant. Do NOT include fluff or filler.
- Tone/Style by platform:
  - LinkedIn: professional, engaging, thought-leadership
  - Twitter: short, punchy, concise
  - Blog: detailed, structured, clear
  - Newsletter: conversational, insightful`,
        prompt: `Topic: ${topic}\nPlatform: ${platform}`,
        output: Output.object({
          schema: z.object({
            title: z.string().describe("Main content title"),
            sections: z.array(
              z.object({
                heading: z.string().describe("Section title"),
                points: z
                  .array(z.string())
                  .describe("2-4 key points per section"),
              }),
            ),
          }),
        }),
      });

      // result.output perfectly matches the Zod schema provided above
      return result.output;
    } catch (error) {
      console.error("error generating outline:", error);
      return {
        error: `Failed to generate outline: ${(error as Error).message}`,
      };
    }
  },
});
