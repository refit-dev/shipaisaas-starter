import { uploadImageFromBase64 } from "@/lib/supabase/storage";
import { tool } from "ai";
import OpenAI from "openai";
import { z } from "zod";

// Initialize the official OpenAI client
// It automatically picks up your process.env.OPENAI_API_KEY
const openai = new OpenAI();

export const buildGenerateImageTool = (teamId: string | null) =>
  tool({
    description:
      "Generate a high-quality visual image, cover photo, or thumbnail based on a prompt.",
    inputSchema: z.object({
      visualPrompt: z
        .string()
        .describe(
          "A highly detailed visual description of the desired image. Be specific about art style, lighting, and composition.",
        ),
    }),
    execute: async ({ visualPrompt }) => {
      if (!teamId) return { error: "Requires active team session." };

      try {
        const response = await openai.images.generate({
          model: "gpt-image-1",
          prompt: visualPrompt,
          n: 1,
          size: "1024x1024",
          quality: "auto",
        });

        const imageData = response.data?.[0];

        if (!imageData?.b64_json) {
          throw new Error("OpenAI returned an empty image response.");
        }

        const imageUrl = await uploadImageFromBase64(imageData.b64_json);

        return {
          success: true,
          imageUrl,
          promptUsed: visualPrompt,
        };
      } catch (error: any) {
        console.error("[Tool] gpt-image-1 Error:", error);

        // Handle OpenAI content policy rejections gracefully
        if (error?.error?.code === "content_policy_violation") {
          return {
            success: false,
            error:
              "Image generation failed: The prompt was rejected by OpenAI's safety system.",
          };
        }

        return {
          success: false,
          error: `Image generation failed: ${error.message}`,
        };
      }
    },
  });
