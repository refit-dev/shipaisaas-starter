import { openai } from "@ai-sdk/openai";
import { generateText, Output, tool } from "ai";
import { z } from "zod";

export const formatScriptTool = tool({
  description:
    "Write the full script narration with timestamps and production cues ONLY AFTER the user has approved the outline.",
  inputSchema: z.object({
    approvedOutline: z
      .string()
      .describe("The raw JSON.stringify() output from generate_script_outline. Must contain an 'acts' array. Do NOT pass plain text."),
    format: z
      .enum(["YouTube", "Podcast", "Webinar", "Ad"])
      .describe("The content format"),
    topic: z.string().describe("The main topic"),
    tone: z.string().optional().describe("Tone of the script"),
    hostName: z
      .string()
      .optional()
      .describe("Host name for podcast or webinar address"),
  }),
  needsApproval: true,
  execute: async ({ approvedOutline, format, topic, tone, hostName }) => {
    try {
      // Validate the outline is a real structured object from generate_script_outline
      let parsedOutline: any;
      try {
        parsedOutline = JSON.parse(approvedOutline);
      } catch {
        return { error: "Invalid approvedOutline: must be the JSON output from generate_script_outline, not plain text." };
      }
      if (!parsedOutline?.acts || !Array.isArray(parsedOutline.acts) || parsedOutline.acts.length === 0) {
        return { error: "Invalid approvedOutline: missing 'acts' array. Run generate_script_outline first." };
      }

      const result = await generateText({
        model: openai("gpt-4o"),
        system: `You are an award-winning scriptwriter for ${format} content.
Write complete, ready-to-record scripts with natural dialogue, proper pacing, and production cues.
${tone ? `Tone: ${tone}.` : ""}
${hostName ? `Host name: ${hostName}.` : ""}`,
        prompt: `Topic: ${topic}\nApproved Outline:\n${approvedOutline}`,
        output: Output.object({
          schema: z.object({
            title: z.string().describe("Final script title"),
            acts: z.array(
              z.object({
                actTitle: z.string(),
                sections: z.array(
                  z.object({
                    timestamp: z
                      .string()
                      .describe(
                        "Timestamp marker (e.g., 00:00, 02:30)",
                      ),
                    cue: z
                      .string()
                      .nullable()
                      .describe(
                        "Production cue (e.g., B-ROLL, MUSIC UP, CUT TO), or null if none",
                      ),
                    narration: z
                      .string()
                      .describe("Full narration text for this section"),
                  }),
                ),
              }),
            ),
            estimatedRuntime: z
              .string()
              .describe(
                "Estimated total runtime (e.g., 8 minutes 30 seconds)",
              ),
          }),
        }),
      });

      return result.output;
    } catch (error) {
      console.error("error writing script:", error);
      return { error: `Failed to write script: ${(error as Error).message}` };
    }
  },
});
