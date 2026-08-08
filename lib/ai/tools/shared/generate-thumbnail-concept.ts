import { openai } from "@ai-sdk/openai";
import { generateText, Output, tool } from "ai";
import { z } from "zod";

export const generateThumbnailConceptTool = tool({
  description:
    "Generate 3 distinct thumbnail design concepts with color schemes, text overlays, and ChatGPT Image prompts.",
  inputSchema: z.object({
    topic: z.string().describe("The video or content topic"),
    platform: z
      .enum(["YouTube", "Blog", "Social"])
      .describe(
        "The target platform (affects aspect ratio and style conventions)",
      ),
    style: z
      .string()
      .optional()
      .describe(
        "Visual style preference (e.g., bold typography, minimalist, photorealistic)",
      ),
  }),
  execute: async ({ topic, platform, style }) => {
    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system: `You are an expert thumbnail designer who creates high-CTR thumbnails for ${platform}.
Generate exactly 3 distinct, visually different design concepts that would maximize click-through rates.
Each concept must include a detailed, ready-to-use ChatGPT Image 3 prompt.`,
        prompt: `Topic: ${topic}\nPlatform: ${platform}${style ? `\nStyle preference: ${style}` : ""}`,
        output: Output.object({
          schema: z.object({
            concepts: z.array(
              z.object({
                conceptNumber: z.number(),
                title: z
                  .string()
                  .describe(
                    "Short concept name (e.g., Bold Contrast, Minimal Clean)",
                  ),
                colorScheme: z.object({
                  primary: z.string().describe("Primary color (hex or name)"),
                  accent: z.string().describe("Accent color (hex or name)"),
                  background: z
                    .string()
                    .describe("Background color (hex or name)"),
                }),
                textOverlays: z
                  .array(z.string())
                  .describe("Text overlays to include on the thumbnail"),
                compositionDescription: z
                  .string()
                  .describe("Layout and composition description"),
                dallePrompt: z
                  .string()
                  .describe(
                    "Detailed ChatGPT Image 3 prompt to generate this exact thumbnail",
                  ),
              }),
            ),
          }),
        }),
      });

      return result.output;
    } catch (error) {
      console.error("error generating thumbnail concepts:", error);
      return {
        error: `Failed to generate thumbnail concepts: ${(error as Error).message}`,
      };
    }
  },
});
