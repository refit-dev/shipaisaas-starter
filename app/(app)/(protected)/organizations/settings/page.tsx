import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema/account";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { OrganizationSettingsClient } from "@/components/organizations/settings-client";

export const dynamic = "force-dynamic";

export const metadata = constructMetadata({
  title: "Organization Settings",
  description: "Manage your workspace settings.",
});

export default async function OrganizationSettingsPage() {
  let organizationData = null;

  try {
    // Get the current session and active organization securely on the server
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const activeOrgId = session?.session.activeOrganizationId;

    if (!activeOrgId) redirect("/dashboard");

    // Fetch the full workspace data from Drizzle

    const result = await db
      .select()
      .from(teams)
      .where(eq(teams.id, activeOrgId))
      .limit(1);

    organizationData = result[0] || null;
  } catch (error) {
    console.error("Error fetching organization:", error);
    redirect("/dashboard");
  }

  return (
    <>
      <DashboardHeader
        heading="Organization Settings"
        text="Manage your workspace settings."
      />
      <div className="mt-8">
        <OrganizationSettingsClient initialData={organizationData} />
      </div>
    </>
  );
}
