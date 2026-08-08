import { Activity, CalendarDays, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Make sure this is installed

interface UsageCardsProps {
  monthlyData: any;
  todayData: any;
  limits: any;
}

export function UsageCards({
  monthlyData,
  todayData,
  limits,
}: UsageCardsProps) {
  // Calculate percentages safely (avoiding divide by zero)
  const monthlyPercent =
    limits.monthlyRequests > 0
      ? Math.min((monthlyData.requests / limits.monthlyRequests) * 100, 100)
      : 0;

  const dailyPercent =
    limits.dailyRequests > 0
      ? Math.min((todayData.requests / limits.dailyRequests) * 100, 100)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Monthly Requests Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Requests
          </CardTitle>
          <CalendarDays className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {monthlyData.requests.toLocaleString()}{" "}
            <span className="text-muted-foreground text-sm font-normal">
              / {limits.monthlyRequests.toLocaleString()}
            </span>
          </div>
          <Progress value={monthlyPercent} className="mt-3 h-2" />
          <p className="text-muted-foreground mt-2 text-xs">
            {monthlyPercent.toFixed(1)}% of your monthly limit used
          </p>
        </CardContent>
      </Card>

      {/* Daily Requests Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today's Requests
          </CardTitle>
          <Activity className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {todayData.requests.toLocaleString()}{" "}
            <span className="text-muted-foreground text-sm font-normal">
              / {limits.dailyRequests.toLocaleString()}
            </span>
          </div>
          <Progress value={dailyPercent} className="mt-3 h-2" />
          <p className="text-muted-foreground mt-2 text-xs">
            {dailyPercent.toFixed(1)}% of your daily limit used
          </p>
        </CardContent>
      </Card>

      {/* Total Tokens Card (No progress bar, just raw stats) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Tokens Used
          </CardTitle>
          <Zap className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {monthlyData.totalTokens.toLocaleString()}
          </div>
          <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
            <span>In: {monthlyData.inputTokens.toLocaleString()}</span>
            <span>Out: {monthlyData.outputTokens.toLocaleString()}</span>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Usage since the start of{" "}
            {new Date().toLocaleDateString(undefined, { month: "long" })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
