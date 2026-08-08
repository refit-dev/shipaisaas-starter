import { openai } from "@ai-sdk/openai";
import { generateText, Output, tool } from "ai";
import { z } from "zod";

// Helper function to inject strict, platform-specific writing rules
const getPlatformInstructions = (platform: string) => {
  switch (platform) {
    case "LinkedIn":
      return `
        - Format: Single post, heavy use of white space.
        - Hook: The first sentence MUST be a bold claim or contrarian hook.
        - Structure: Use 1-2 sentence paragraphs max. 
        - Tone: Professional, authoritative, but accessible. NO cringe corporate speak ("I am thrilled to announce").
        - Call to Action: End with a specific question to drive comments.
      `;
    case "Twitter":
      return `
        - Format: A threaded sequence of tweets.
        - Hook: The first tweet must be a viral-style hook outlining the value.
        - Structure: Number each tweet (e.g., 1/7, 2/7). KEEP EACH TWEET UNDER 280 CHARACTERS.
        - Tone: Punchy, concise, high-signal-to-noise ratio.
      `;
    case "Blog":
      return `
        - Format: Long-form Markdown article.
        - Structure: Must include an H1 title, an engaging intro, H2s for main sections, and bulleted lists for readability.
        - Tone: SEO-optimized, highly educational, and structured.
        - Call to Action: End with a strong conclusion and next steps.
      `;
    case "Newsletter":
      return `
        - Format: Email newsletter edition.
        - Structure: Start with a personal greeting. Use storytelling to introduce the core concept before diving into the tactical breakdown.
        - Tone: Intimate, conversational, like writing to a smart friend.
      `;
    default:
      return "- Write clear, engaging, and professional content.";
  }
};

export const formatPostTool = tool({
  description:
    "Use this tool to write the final draft of a post ONLY AFTER the user has approved the outline.",
  inputSchema: z.object({
    platform: z
      .enum(["LinkedIn", "Twitter", "Blog", "Newsletter", "Instagram"])
      .describe("The target platform"),
    topic: z.string().describe("The main topic of the post"),
    approvedOutline: z
      .string()
      .describe("The stringified version of the user-approved outline"),
    tone: z
      .string()
      .optional()
      .describe(
        "Any specific tone requested by the user (e.g., funny, serious)",
      ),
  }),
  needsApproval: true, // This flag indicates that the tool should only be executed after user approval
  execute: async ({ platform, topic, approvedOutline, tone }) => {
    try {
      const platformRules = getPlatformInstructions(platform);

      const result = await generateText({
        model: openai("gpt-4o"), // Use your best model for the actual writing
        system: `You are an elite, top-1% copywriter specializing in ${platform}.
        
        Your task is to write the final draft based EXACTLY on the provided outline. Do not hallucinate new sections.
        
        STRICT PLATFORM RULES:
        ${platformRules}

        ${tone ? `ADDITIONAL TONE CONSTRAINT: Make the writing sound ${tone}.` : ""}
        `,
        prompt: `Topic: ${topic}\n\nApproved Outline:\n${approvedOutline}`,
        output: Output.object({
          schema: z.object({
            content: z
              .string()
              .describe(
                "The fully written, perfectly formatted draft ready for publishing.",
              ),
            hashtags: z
              .array(z.string())
              .describe("3-5 highly relevant, platform-optimized hashtags."),
            suggestedImagePrompt: z
              .string()
              .describe(
                "A highly detailed prompt that can be sent to an AI image generator to create a perfect cover image for this post.",
              ),
          }),
        }),
      });

      return result.output;
    } catch (error) {
      console.error("error formatting post:", error);
      return { error: `Failed to format post: ${(error as Error).message}` };
    }
  },
});
