"use server";

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamMembers, teams } from "@/lib/db/schema/account";

export interface OnboardingData {
  teamId: string;
  name: string;
  slug: string;
  email: string;
  businessName?: string;
  businessType?: string;
  businessDescription?: string;
  website?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  currency?: string;
}

export async function completeOnboarding(data: OnboardingData) {
  try {
    // 1. Verify global session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized. Please log in." };
    }

    // 2. Strict Security Check: Does this user actually own the requested team?
    const validMembership = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, data.teamId), // Compare against the requested ID
          eq(teamMembers.userId, session.user.id), // Compare against the active session
          eq(teamMembers.role, "owner"), // Ensure they have the rights to modify it
        ),
      );

    // If the array is empty, they are either not in the team, or not an owner.
    if (validMembership.length === 0) {
      return {
        error:
          "Unauthorized: You do not have permission to modify this workspace.",
      };
    }

    // 3. Safe to update!
    await db
      .update(teams)
      .set({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        email: data.email,
        businessName: data.businessName,
        businessType: data.businessType,
        businessDescription: data.businessDescription,
        website: data.website,
        country: data.country,
        city: data.city,
        address: data.address,
        phone: data.phone,
        currency: data.currency || "USD",
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, data.teamId)); // Update using the validated ID

    return { success: true };
  } catch (error: any) {
    console.error("Onboarding Error:", error);

    // 1. Unwrap the Drizzle error to get the raw database error
    const dbError = error.cause || error;

    // 2. Check the specific Postgres error code or the stringified cause
    if (
      dbError.code === "23505" ||
      String(dbError).includes("teams_slug_unique")
    ) {
      return {
        error: "That Workspace URL is already taken. Please choose another.",
      };
    }

    return { error: "Something went wrong while saving your workspace." };
  }
}
