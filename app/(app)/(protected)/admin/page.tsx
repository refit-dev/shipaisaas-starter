
import { constructMetadata } from "@/lib/utils";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Admin Overview",
  description: "Global metrics and recent platform activity.",
});

export default async function AdminPage() {
  return (
    <>
      <DashboardHeader heading={"Admin Overview"} text={"Platform health, global metrics, and recent activity."} />
      <div className="mt-6">
        <AdminDashboardClient />
      </div>
    </>
  );
}
