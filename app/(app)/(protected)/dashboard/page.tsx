import { getTranslations } from "next-intl/server";

import { constructMetadata } from "@/lib/utils";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Dashboard",
  description: "Your AI workforce at a glance.",
});

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  return (
    <>
      <DashboardHeader heading={t("title")} text={t("subtitle")} />
      <div className="mt-6">
        <DashboardClient />
      </div>
    </>
  );
}
