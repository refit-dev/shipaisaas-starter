"use client";

import { useEffect, useState } from "react";
import { Building2, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminUsageCards } from "@/components/admin/admin-usage-cards";
import { UsageChart } from "@/components/dashboard/usage-chart"; // You can reuse your existing chart!

interface AdminUsageClientProps {
  organizations: Array<{ id: string; name: string; slug: string }>;
}

export function AdminUsageClient({ organizations }: AdminUsageClientProps) {
  const [days, setDays] = useState("30");
  const [teamId, setTeamId] = useState("all");

  const [data, setData] = useState<{
    monthly: any;
    daily: any[];
    limits: any;
    today: any;
    isGlobal: boolean;
    planName: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days: parseInt(days), teamId }),
        });
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, [days, teamId]);

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* Filters Toolbar */}
      <div className="border-border bg-card flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex w-full flex-col items-start gap-4 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Building2 className="text-muted-foreground hidden h-4 w-4 sm:block" />
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  🌐 All Organizations (Global)
                </SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name} (/{org.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data && !data.isGlobal && (
            <Badge variant="secondary" className="capitalize">
              {data.planName} Plan
            </Badge>
          )}
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <CalendarDays className="text-muted-foreground hidden h-4 w-4 sm:block" />
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="14">Last 14 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Cards */}
      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : (
        <AdminUsageCards
          monthlyData={data.monthly}
          todayData={data.today}
          limits={data.limits}
          isGlobal={data.isGlobal}
        />
      )}

      {/* Usage Chart (Reusing your exact User Chart) */}
      {isLoading || !data ? (
        <Skeleton className="h-[400px] w-full rounded-xl" />
      ) : (
        <UsageChart dailyData={data.daily} />
      )}
    </div>
  );
}
