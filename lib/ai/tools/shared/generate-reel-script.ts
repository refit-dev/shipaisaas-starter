import { openai } from "@ai-sdk/openai";
import { generateText, Output, tool } from "ai";
import { z } from "zod";

export const generateReelScriptTool = tool({
  description:
    "Generate a structured short-form video script with scenes, hook, and CTA before finalizing the reel.",
  inputSchema: z.object({
    topic: z.string().describe("The main subject of the reel"),
    platform: z
      .enum(["Instagram", "TikTok", "YouTube Shorts"])
      .describe("The target platform"),
    tone: z
      .string()
      .optional()
      .describe(
        "Tone of the reel (e.g., educational, entertaining, motivational)",
      ),
    durationSeconds: z
      .number()
      .min(15)
      .max(90)
      .default(30)
      .describe("Target duration in seconds"),
  }),
  execute: async ({ topic, platform, tone, durationSeconds }) => {
    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system: `You are an expert short-form video creator specializing in ${platform}.
Create engaging, scroll-stopping reel scripts that hook viewers within the first 2 seconds.
Each scene should be punchy and fast-paced to match the platform's attention span.`,
        prompt: `Topic: ${topic}\nPlatform: ${platform}\nTarget Duration: ${durationSeconds} seconds${tone ? `\nTone: ${tone}` : ""}`,
        output: Output.object({
          schema: z.object({
            hook: z
              .string()
              .describe(
                "Opening line or visual that grabs attention in the first 2 seconds",
              ),
            scenes: z.array(
              z.object({
                sceneNumber: z.number(),
                action: z
                  .string()
                  .describe("Visual action or b-roll description"),
                narration: z
                  .string()
                  .describe("What is said or written on screen"),
                durationSeconds: z
                  .number()
                  .describe("Duration of this scene in seconds"),
              }),
            ),
            cta: z.string().describe("Call to action at the end of the reel"),
            hashtags: z
              .array(z.string())
              .describe("5-10 relevant platform-optimized hashtags"),
          }),
        }),
      });

      return result.output;
    } catch (error) {
      console.error("error generating reel script:", error);
      return {
        error: `Failed to generate reel script: ${(error as Error).message}`,
      };
    }
  },
});
