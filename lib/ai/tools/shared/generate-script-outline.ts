import { openai } from "@ai-sdk/openai";
import { generateText, Output, tool } from "ai";
import { z } from "zod";

export const generateScriptOutlineTool = tool({
  description:
    "Generate a structured script outline by acts and segments before writing the full narration.",
  inputSchema: z.object({
    topic: z.string().describe("The main subject of the script"),
    format: z
      .enum(["YouTube", "Podcast", "Webinar", "Ad"])
      .describe("The content format"),
    targetDurationMinutes: z
      .number()
      .min(1)
      .max(120)
      .optional()
      .describe("Target duration in minutes"),
    tone: z
      .string()
      .optional()
      .describe("Tone (e.g., educational, entertaining, persuasive)"),
  }),
  execute: async ({ topic, format, targetDurationMinutes, tone }) => {
    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system: `You are an expert scriptwriter specializing in ${format} content.
Create clear, engaging script outlines that serve as solid foundations for compelling content.
Structure the outline into logical acts with well-defined segments.`,
        prompt: `Topic: ${topic}\nFormat: ${format}${targetDurationMinutes ? `\nTarget Duration: ${targetDurationMinutes} minutes` : ""}${tone ? `\nTone: ${tone}` : ""}`,
        output: Output.object({
          schema: z.object({
            title: z.string().describe("Working title for the script"),
            totalEstimatedMinutes: z
              .number()
              .describe("Total estimated runtime in minutes"),
            acts: z.array(
              z.object({
                actNumber: z.number(),
                actTitle: z.string().describe("Name of this act or section"),
                segments: z.array(
                  z.object({
                    segmentTitle: z.string(),
                    keyPoints: z
                      .array(z.string())
                      .describe("2-4 key points to cover in this segment"),
                    estimatedMinutes: z.number(),
                  }),
                ),
              }),
            ),
          }),
        }),
      });

      return result.output;
    } catch (error) {
      console.error("error generating script outline:", error);
      return {
        error: `Failed to generate script outline: ${(error as Error).message}`,
      };
    }
  },
});
