import { openai } from "@ai-sdk/openai";
import { generateText, Output, tool } from "ai";
import { z } from "zod";

export const formatReelTool = tool({
  description:
    "Use this tool to finalize the reel content package ONLY AFTER the user has approved the reel script.",
  inputSchema: z.object({
    approvedScript: z
      .string()
      .describe("The stringified version of the approved reel script"),
    platform: z
      .enum(["Instagram", "TikTok", "YouTube Shorts"])
      .describe("The target platform"),
    topic: z.string().describe("The main topic of the reel"),
    tone: z.string().optional().describe("Tone of the reel"),
  }),
  needsApproval: true,
  execute: async ({ approvedScript, platform, topic, tone }) => {
    try {
      const result = await generateText({
        model: openai("gpt-4o"),
        system: `You are an elite short-form video content specialist for ${platform}.
Write polished, platform-optimized reel content packages based on the approved script.
${tone ? `Tone constraint: ${tone}.` : ""}`,
        prompt: `Topic: ${topic}\nApproved Script:\n${approvedScript}`,
        output: Output.object({
          schema: z.object({
            title: z
              .string()
              .describe("Catchy reel title (max 60 characters)"),
            captionText: z
              .string()
              .describe("Full caption text optimized for the platform"),
            scenes: z.array(
              z.object({
                sceneNumber: z.number(),
                visualDirection: z
                  .string()
                  .describe("Detailed visual or b-roll direction"),
                narration: z
                  .string()
                  .describe(
                    "Polished on-screen text or voiceover narration",
                  ),
                durationSeconds: z.number(),
              }),
            ),
            hashtags: z
              .array(z.string())
              .describe("10-15 optimized hashtags"),
            thumbnailPrompt: z
              .string()
              .describe(
                "Detailed ChatGPT Image prompt for the reel thumbnail or cover image",
              ),
          }),
        }),
      });

      return result.output;
    } catch (error) {
      console.error("error formatting reel:", error);
      return { error: `Failed to format reel: ${(error as Error).message}` };
    }
  },
});
