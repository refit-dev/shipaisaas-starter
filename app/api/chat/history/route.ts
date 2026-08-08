import { and, eq } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { conversations, messages as messagesTable } from "@/lib/db/schema/chat";

export const GET = withAuth(async ({ req, team }) => {
  const url = new URL(req.url);
  const conversationId = url.searchParams.get("id");

  if (!conversationId) {
    return new Response("Missing conversation ID", { status: 400 });
  }

  try {
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.teamId, team.id),
      ),
    });

    if (!conversation) {
      return new Response("Conversation not found.", { status: 404 });
    }

    const history = await db.query.messages.findMany({
      where: eq(messagesTable.conversationId, conversationId),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });

    // Map the database rows back into Vercel AI SDK UIMessage objects
    const formattedMessages = history.map((msg) => ({
      id: msg.sdkId,
      role: msg.role as "user" | "assistant" | "system",
      parts: msg.parts,
    }));

    return Response.json(
      { messages: formattedMessages, conversation },
      { status: 200 },
    );
  } catch (error) {
    return new Response("Failed to fetch history", { status: 500 });
  }
});
