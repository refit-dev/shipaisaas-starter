import { tool } from "ai";
import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema/agent";

export const memoryTool = (teamId: string) => {
  return tool({
    description: `Use this tool to read and maintain long-term memory for the user.
    Rules:
    - Store durable user facts in the 'core' key.
    - Store specific project notes (like search results or draft posts) in descriptive keys like 'marketing_trends_draft'.
    - If the user refers to past work, use 'search' to find it.`,

    inputSchema: z.object({
      command: z.enum(["view", "create", "update", "search"]),
      key: z
        .string()
        .optional()
        .describe(
          "The memory identifier, e.g., 'core' or 'q3_campaign_notes'. Required for view, create, update.",
        ),
      content: z
        .string()
        .optional()
        .describe("Text to write for create/update commands."),
      mode: z.enum(["append", "overwrite"]).default("overwrite"),
      query: z.string().optional().describe("Keywords for the search command."),
    }),

    execute: async ({ command, key, content, mode, query }) => {
      try {
        switch (command) {
          case "view":
            if (!key) return "Error: key is required for view.";
            const memory = await db.query.memories.findFirst({
              where: and(eq(memories.teamId, teamId), eq(memories.key, key)),
            });
            return memory ? memory.content : `No memory found for key: ${key}`;

          case "create":
          case "update":
            if (!key || !content) return "Error: key and content are required.";

            // Check if it exists
            const existing = await db.query.memories.findFirst({
              where: and(eq(memories.teamId, teamId), eq(memories.key, key)),
            });

            let newContent = content;
            if (existing && mode === "append") {
              newContent = `${existing.content}\n\n${content}`;
            }

            // Upsert (Insert or Update)
            if (existing) {
              await db
                .update(memories)
                .set({ content: newContent, updatedAt: new Date() })
                .where(eq(memories.id, existing.id));
            } else {
              await db.insert(memories).values({
                teamId,
                key,
                content: newContent,
              });
            }
            return `Successfully saved memory under key: ${key}`;

          case "search":
            if (!query) return "Error: query is required for search.";
            // Simple SQL text search (No RAG required yet!)
            const results = await db.query.memories.findMany({
              where: and(
                eq(memories.teamId, teamId),
                ilike(memories.content, `%${query}%`),
              ),
              limit: 3,
            });

            if (results.length === 0) return "No matching memories found.";
            return results
              .map((r) => `[Key: ${r.key}]\n${r.content}`)
              .join("\n\n---\n\n");

          default:
            return "Invalid command.";
        }
      } catch (error) {
        console.error("error using memory:", error);
        return `Memory action failed: ${(error as Error).message}`;
      }
    },
  });
};
