import { constructMetadata } from "@/lib/utils";
import { OrganizationsClient } from "@/components/admin/organizations-client";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Manage Organizations",
});

export default function AdminOrganizationsPage() {
  return (
    <>
      <DashboardHeader
        heading="Organizations"
        text="Manage workspaces, view subscription statuses, and monitor usage."
      />
      <div className="mt-6">
        <OrganizationsClient />
      </div>
    </>
  );
}
