import { getTranslations } from "next-intl/server";

import { constructMetadata } from "@/lib/utils";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Admin Overview",
  description: "Global metrics and recent platform activity.",
});

export default async function AdminPage() {
  const t = await getTranslations("admin.overview");
  return (
    <>
      <DashboardHeader heading={t("title")} text={t("subtitle")} />
      <div className="mt-6">
        <AdminDashboardClient />
      </div>
    </>
  );
}
