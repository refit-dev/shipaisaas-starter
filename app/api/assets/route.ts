import { and, desc, eq, gte, lte } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema/agent";

// GET /api/assets?conversationId=...&type=...&from=...&to=...&limit=...&offset=...
export const GET = withAuth(async ({ req, team }) => {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "60"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const conditions = [eq(assets.teamId, team.id)];
  if (conversationId) conditions.push(eq(assets.conversationId, conversationId));
  if (type) conditions.push(eq(assets.type, type));
  if (from) conditions.push(gte(assets.createdAt, new Date(from)));
  if (to) conditions.push(lte(assets.createdAt, new Date(to)));

  try {
    const data = await db.query.assets.findMany({
      where: and(...conditions),
      orderBy: [desc(assets.createdAt)],
      limit,
      offset,
    });

    return Response.json(data);
  } catch (error) {
    console.error("[assets] failed to fetch:", error);
    return new Response("Failed to fetch assets", { status: 500 });
  }
});
