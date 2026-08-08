"use server";

import { headers } from "next/headers";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  monthlyUsages,
  teamMembers,
  teams,
  users,
} from "@/lib/db/schema/account";

// Helper to ensure the user is an admin
async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (
    !session?.user ||
    (session.user.role !== "admin" && session.user.role !== "superadmin")
  ) {
    throw new Error("Unauthorized");
  }
}

export async function getAdminOrganizations(
  page = 1,
  pageSize = 10,
  search = "",
) {
  await requireAdmin();

  const offset = (page - 1) * pageSize;
  const searchCondition = search
    ? or(ilike(teams.name, `%${search}%`), ilike(teams.slug, `%${search}%`))
    : undefined;

  const [data, totalCount] = await Promise.all([
    db.query.teams.findMany({
      where: searchCondition,
      orderBy: [desc(teams.createdAt)],
      limit: pageSize,
      offset: offset,
    }),
    db.select({ count: count() }).from(teams).where(searchCondition),
  ]);

  return {
    organizations: data,
    total: totalCount[0]?.count || 0,
  };
}

export async function getAdminOrganizationDetails(teamId: string) {
  await requireAdmin();

  // Fetch team, its members, and its token usage in parallel
  const [team, members, usage] = await Promise.all([
    db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    }),
    db
      .select({
        id: teamMembers.id,
        role: teamMembers.role,
        joinedAt: teamMembers.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId)),
    db.query.monthlyUsages.findMany({
      where: eq(monthlyUsages.teamId, teamId),
      orderBy: [desc(monthlyUsages.year), desc(monthlyUsages.month)],
      limit: 12, // Last 12 months
    }),
  ]);

  return { team, members, usage };
}
