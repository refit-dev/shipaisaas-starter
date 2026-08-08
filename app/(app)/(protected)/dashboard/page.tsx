
import { constructMetadata } from "@/lib/utils";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Dashboard",
  description: "Your AI workforce at a glance.",
});

export default async function DashboardPage() {
  return (
    <>
      <DashboardHeader heading={"Dashboard"} text={"Your AI workforce at a glance."} />
      <div className="mt-6">
        <DashboardClient />
      </div>
    </>
  );
}
