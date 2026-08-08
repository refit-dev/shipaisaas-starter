import { Activity, CalendarDays, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AdminUsageCardsProps {
  monthlyData: any;
  todayData: any;
  limits: any;
  isGlobal: boolean;
}

export function AdminUsageCards({
  monthlyData,
  todayData,
  limits,
  isGlobal,
}: AdminUsageCardsProps) {
  const monthlyPercent =
    !isGlobal && limits.monthlyRequests > 0
      ? Math.min((monthlyData.credits / limits.monthlyRequests) * 100, 100)
      : 0;

  const dailyPercent =
    !isGlobal && limits.dailyRequests > 0
      ? Math.min((todayData.credits / limits.dailyRequests) * 100, 100)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Monthly Requests Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Requests
          </CardTitle>
          <CalendarDays className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {monthlyData.credits.toLocaleString()}{" "}
            {!isGlobal && limits.monthlyRequests > 0 && (
              <span className="text-muted-foreground text-sm font-normal">
                / {limits.monthlyRequests.toLocaleString()}
              </span>
            )}
          </div>
          {!isGlobal && limits.monthlyRequests > 0 ? (
            <>
              <Progress value={monthlyPercent} className="mt-3 h-2" />
              <p className="text-muted-foreground mt-2 text-xs">
                {monthlyPercent.toFixed(1)}% of limit used
              </p>
            </>
          ) : (
            <p className="text-muted-foreground mt-2 text-xs">
              Total aggregate requests
            </p>
          )}
        </CardContent>
      </Card>

      {/* Daily Requests Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today's Requests
          </CardTitle>
          <Activity className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {todayData.credits.toLocaleString()}{" "}
            {!isGlobal && limits.dailyRequests > 0 && (
              <span className="text-muted-foreground text-sm font-normal">
                / {limits.dailyRequests.toLocaleString()}
              </span>
            )}
          </div>
          {!isGlobal && limits.dailyRequests > 0 ? (
            <>
              <Progress value={dailyPercent} className="mt-3 h-2" />
              <p className="text-muted-foreground mt-2 text-xs">
                {dailyPercent.toFixed(1)}% of limit used
              </p>
            </>
          ) : (
            <p className="text-muted-foreground mt-2 text-xs">
              Requests processed today
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Tokens Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Tokens Used
          </CardTitle>
          <Zap className="text-muted-foreground h-4 w-4" />
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
