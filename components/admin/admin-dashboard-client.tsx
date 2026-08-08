"use client";

import { useEffect, useState } from "react";
import { Building2, Database, Loader2, Users, Zap } from "lucide-react";

import { useTranslations } from "next-intl";

import { formatCompactNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentSignups } from "@/components/admin/recent-signups";
import { StatCard } from "@/components/admin/stat-card";

// Define the expected shape from your API
export type AdminDashboardData = {
  kpis: {
    totalUsers: number;
    totalOrganizations: number;
    totalTokensUsed: number;
    activeSubscriptions: number;
  };
  recentSignups: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
  }>;
};

export function AdminDashboardClient() {
  const t = useTranslations("admin.kpi");
  const tAdmin = useTranslations("admin");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // You will need to create this API endpoint to aggregate your DB stats
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="border-border bg-card flex h-64 items-center justify-center rounded-xl border">
        <p className="text-muted-foreground">{tAdmin("errorLoad")}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("totalUsers")}
          value={data.kpis.totalUsers.toLocaleString()}
          icon={Users}
          description={t("totalUsersSubtitle")}
        />
        <StatCard
          title={t("organizations")}
          value={data.kpis.totalOrganizations.toLocaleString()}
          icon={Building2}
          description={t("organizationsSubtitle")}
        />
        <StatCard
          title={t("tokenUsage")}
          value={formatCompactNumber(data.kpis.totalTokensUsed)}
          icon={Database}
          description={t("tokenUsageSubtitle")}
        />
        <StatCard
          title={t("paidPlans")}
          value={data.kpis.activeSubscriptions.toLocaleString()}
          icon={Zap}
          description={t("paidPlansSubtitle")}
        />
      </div>

      {/* History and Charts Row */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* We give the table 2 columns of space on extra-large screens */}
        <div className="xl:col-span-3">
          <RecentSignups signups={data.recentSignups} />
        </div>

        {/* You can add a donut chart or quick-actions card here later in the 3rd column */}
        {/* <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border p-6 text-center shadow-sm">
          <Database className="text-muted-foreground mb-4 h-8 w-8 opacity-50" />
          <h3 className="text-foreground text-sm font-medium">System Status</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            All services operational
          </p>
        </div> */}
      </div>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[400px] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  );
}
