import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema/account";
import { constructMetadata } from "@/lib/utils";
import { AdminUsageClient } from "@/components/admin/admin-usage-client";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Global Usage",
  description:
    "Monitor platform-wide and organization-specific API consumption.",
});

export default async function AdminUsagePage() {
  // Fetch a lightweight list of all workspaces to populate the dropdown
  const allOrganizations = await db.query.teams.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: [desc(teams.createdAt)],
  });

  return (
    <>
      <DashboardHeader
        heading="Global Usage"
        text="Monitor token consumption across the entire platform or filter by workspace."
      />
      <div className="mt-6">
        <AdminUsageClient organizations={allOrganizations} />
      </div>
    </>
  );
}
