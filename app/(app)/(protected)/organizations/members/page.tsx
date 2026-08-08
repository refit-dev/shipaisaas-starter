import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { MembersClient } from "@/components/organizations/members-client";

export const dynamic = "force-dynamic";

export const metadata = constructMetadata({
  title: "Team Members",
  description: "Manage your workspace members and invitations.",
});

export default async function MembersPage() {
  try {
    // Get active organization
    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });

    if (!org) redirect("/organizations");
  } catch (error) {
    // redirect to organizations page if there's an error fetching the organization (e.g., no access, not found)
    console.error("Error fetching organization:", error);
    redirect("/organizations");
  }

  return (
    <>
      <DashboardHeader
        heading="Team Members"
        text="Manage who has access to your workspace and their permission levels."
      />
      <div className="mt-8">
        <MembersClient />
      </div>
    </>
  );
}
