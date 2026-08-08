import { and, desc, eq } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema/chat";

export const GET = withAuth(async ({ team }) => {
  try {
    const history = await db.query.conversations.findMany({
      where: eq(conversations.teamId, team.id),
      orderBy: [desc(conversations.updatedAt)], // Newest first
      limit: 50,
    });

    return Response.json(history, { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch conversations", { status: 500 });
  }
});

export const DELETE = withAuth(async ({ req, team }) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response("Missing conversation ID", { status: 400 });
  }

  try {
    await db.delete(conversations).where(
      and(
        eq(conversations.id, id),
        eq(conversations.teamId, team.id), // Security check
      ),
    );

    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response("Failed to delete conversation", { status: 500 });
  }
});
