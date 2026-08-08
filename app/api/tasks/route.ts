import { desc, eq } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema/chat";

// GET /api/tasks
// Returns all manual (non-workflow) conversations for the team,
// ordered by most recently updated. Each row is a "task" in the UI.
export const GET = withAuth(async ({ team }) => {
  try {
    const data = await db.query.conversations.findMany({
      where: eq(conversations.teamId, team.id),
      orderBy: [desc(conversations.updatedAt)],
      with: {
        messages: {
          orderBy: (messages, { desc }) => [desc(messages.createdAt)],
          limit: 1,
          columns: {
            role: true,
            parts: true,
            createdAt: true,
          },
        },
      },
    });

    // Shape each row for the client
    const tasks = data.map(({ messages, ...conv }) => {
      const lastMessage = messages[0] ?? null;
      const preview = lastMessage
        ? extractTextPreview(lastMessage.parts as any[])
        : null;

      return {
        ...conv,
        type: conv.workflowId ? "workflow" : "task",
        lastMessageAt: lastMessage?.createdAt ?? conv.updatedAt,
        lastMessageRole: lastMessage?.role ?? null,
        preview,
      };
    });

    return Response.json(tasks);
  } catch (error) {
    console.error("[tasks] failed to fetch:", error);
    return new Response("Failed to fetch tasks", { status: 500 });
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractTextPreview(parts: any[], maxLength = 120): string | null {
  if (!Array.isArray(parts)) return null;

  for (const part of parts) {
    if (part.type === "text" && typeof part.text === "string") {
      const trimmed = part.text.trim();
      if (!trimmed) continue;
      return trimmed.length > maxLength
        ? trimmed.slice(0, maxLength) + "…"
        : trimmed;
    }
  }

  return null;
}
