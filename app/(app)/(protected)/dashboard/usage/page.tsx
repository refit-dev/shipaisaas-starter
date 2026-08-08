"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard/header";
import { UsageCards } from "@/components/dashboard/usage-cards";
import { UsageChart } from "@/components/dashboard/usage-chart";

export default function UsagePage() {
  const { userSubscriptionPlan } = useUserStore();
  const [days, setDays] = useState("30");
  const [data, setData] = useState<{
    monthly: any;
    daily: any[];
    limits: any;
    today: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/team/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days: parseInt(days) }),
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
  }, [days]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <DashboardHeader
          heading="Usage"
          text="Monitor your team's API consumption and plan limits."
        />

        {/* Current Plan Information Badge */}
        {userSubscriptionPlan && (
          <div className="mt-4 flex items-center gap-3 sm:mt-0">
            <span className="text-muted-foreground text-sm">Current Plan:</span>
            <Badge
              variant={userSubscriptionPlan.isPaid ? "default" : "secondary"}
            >
              {userSubscriptionPlan.title}
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-6">
        {isLoading || !data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : (
          <UsageCards
            monthlyData={data.monthly}
            todayData={data.today}
            limits={data.limits}
          />
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Usage History</h3>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="14">Last 14 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading || !data ? (
          <Skeleton className="h-[400px] w-full rounded-xl" />
        ) : (
          <UsageChart dailyData={data.daily} />
        )}
      </div>
    </>
  );
}
