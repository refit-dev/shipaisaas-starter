"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssistantStore } from "@/stores/assistantStore";
import { useUserStore } from "@/stores/userStore";
import { UserSubscriptionPlan } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Bot,
  Clock,
  MessageSquare,
  PauseCircle,
  Sparkles,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RecentTask = {
  id: string;
  title: string;
  niche: string;
  workflowId: string | null;
  updatedAt: string;
};

type DashboardData = {
  kpis: {
    totalTasks: number;
    pendingApprovals: number;
    totalAssets: number;
    assetsThisWeek: number;
    activeWorkflows: number;
    totalRuns: number;
    hoursSaved: number;
  };
  actionItems: any[];
  recentAssets: any[];
  recentTasks: RecentTask[];
  assetsByType: { type: string; count: number }[];
  activityChartData: { date: string; runs: number; tasks: number }[];
  usage: {
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    credits: number;
  } | null;
};

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// ---------------------------------------------------------------------------
// DashboardClient
// ---------------------------------------------------------------------------

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { userSubscriptionPlan } = useUserStore();
  const { isOpen, mode } = useAssistantStore();
  const sidebarOpen = isOpen && mode === "sidebar";
  const t = useTranslations("dashboard");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const isEmpty =
    !data ||
    (data.kpis.totalRuns === 0 &&
      data.kpis.totalTasks === 0 &&
      data.kpis.totalAssets === 0);
  if (isEmpty) return <EmptyDashboard />;

  const {
    kpis,
    actionItems,
    recentAssets,
    recentTasks,
    assetsByType,
    activityChartData,
    usage,
  } = data;
  const usagePct = usage
    ? Math.min(
        (usage.credits /
          (userSubscriptionPlan?.usageLimits?.monthlyRequests || 1)) *
          100,
        100,
      )
    : 0;

  const tooltipTextColor =
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement)
          .getPropertyValue("--foreground")
          .trim()
      : "#000";

  return (
    <div className="space-y-6">
      {/* ── KPI cards ──────────────────────────────────────────── */}
      <div className={cn("grid grid-cols-2 gap-4", !sidebarOpen && "lg:grid-cols-4")}>
        {/* Tasks */}
        <Link href="/dashboard/agents">
          <Card className="transition-colors hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("kpi.tasks")}</CardTitle>
              <MessageSquare className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.totalTasks.toLocaleString()}</p>
              <p className="text-muted-foreground mt-1 text-xs">{t("kpi.tasksSubtitle")}</p>
            </CardContent>
          </Card>
        </Link>

        {/* Pending approvals */}
        <Link href="/dashboard/workflows">
          <Card
            className={cn(
              "transition-colors hover:border-amber-300",
              kpis.pendingApprovals > 0 &&
                "border-amber-300 bg-amber-50 dark:bg-amber-950/30",
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("kpi.pendingApproval")}
              </CardTitle>
              <PauseCircle
                className={cn(
                  "size-4",
                  kpis.pendingApprovals > 0
                    ? "text-amber-500"
                    : "text-muted-foreground",
                )}
              />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.pendingApprovals}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {kpis.pendingApprovals > 0 ? t("kpi.actionNeeded") : t("kpi.allClear")}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Total assets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("kpi.assetsGenerated")}
            </CardTitle>
            <Sparkles className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {kpis.totalAssets.toLocaleString()}
            </p>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <TrendingUp className="size-3 text-green-500" />
              {t("kpi.assetsThisWeek", { count: kpis.assetsThisWeek })}
            </p>
          </CardContent>
        </Card>

        {/* Active workflows */}
        <Link href="/dashboard/workflows">
          <Card className="transition-colors hover:border-blue-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("kpi.activeWorkflows")}
              </CardTitle>
              <Workflow className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpis.activeWorkflows}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("kpi.totalRuns", { count: kpis.totalRuns })}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Usage glance + Time saved */}
      <div className={cn("grid gap-4", sidebarOpen ? "grid-cols-2" : "lg:grid-cols-4")}>
        <div className={sidebarOpen ? "" : "lg:col-span-3"}>
          <UsageGlance
            usage={usage}
            usagePct={usagePct}
            subscriptionPlan={userSubscriptionPlan}
          />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("kpi.timeSaved")}</CardTitle>
            <Clock className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.hoursSaved}h</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {t("kpi.timeSavedSubtitle")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts row ─────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity chart — takes 2/3 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {t("charts.activity")}
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="inline-block size-2 rounded-full" style={{ background: "var(--chart-2)" }} />
                  {t("charts.tasks")}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="inline-block size-2 rounded-full" style={{ background: "var(--chart-1)" }} />
                  {t("charts.runs")}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={activityChartData} margin={{ left: 0, right: 0 }}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tick={{ fontSize: 11, fill: "var(--accent-foreground)" }}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <Line
                  dataKey="tasks"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  dataKey="runs"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset breakdown — takes 1/3 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("charts.assetOutput")}</CardTitle>
          </CardHeader>
          <CardContent>
            {assetsByType.length === 0 ? (
              <div className="text-muted-foreground flex h-[180px] items-center justify-center text-xs">
                {t("charts.noAssets")}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie
                      data={assetsByType}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={56}
                      paddingAngle={3}
                    >
                      {assetsByType.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "var(--primary)",
                      }}
                      labelStyle={{ color: "var(--foreground)" }}
                      itemStyle={{ color: "var(--foreground)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {assetsByType.map((item, i) => (
                    <div
                      key={item.type}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{
                            background: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-muted-foreground capitalize">
                          {item.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className="font-medium tabular-nums">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent tasks ───────────────────────────────────────── */}
      {recentTasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("recentTasks.title")}</h3>
            <Link
              href="/dashboard/tasks"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              {t("recentTasks.viewAll")}
            </Link>
          </div>
          <div className="divide-y overflow-hidden rounded-lg border">
            {recentTasks.map((task) => (
              <TaskFeedItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TaskFeedItem
// ---------------------------------------------------------------------------

function TaskFeedItem({ task }: { task: RecentTask }) {
  const isWorkflow = !!task.workflowId;
  const t = useTranslations("dashboard");
  const { setActiveConversationId, setActiveConversation, setMode, setIsOpen } =
    useAssistantStore();

  const handleOpen = () => {
    setActiveConversationId(task.id);
    setActiveConversation(task as any);
    setMode("sidebar");
    setIsOpen(true);
  };

  return (
    <button
      onClick={handleOpen}
      className="group hover:bg-muted/40 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
    >
      {isWorkflow ? (
        <Workflow className="text-muted-foreground size-3.5 shrink-0" />
      ) : (
        <MessageSquare className="text-muted-foreground size-3.5 shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        <p className="group-hover:text-accent-foreground truncate text-xs font-medium transition-colors">
          {task.title}
        </p>
        {task.niche && task.niche !== "general" && (
          <p className="text-muted-foreground mt-0.5 text-[11px] capitalize">{task.niche}</p>
        )}
      </div>

      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
          isWorkflow
            ? "bg-secondary text-secondary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {isWorkflow ? t("recentTasks.workflow") : t("recentTasks.task")}
      </span>

      <span className="text-muted-foreground hidden shrink-0 text-[11px] sm:block">
        {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// UsageGlance
// ---------------------------------------------------------------------------

function UsageGlance({
  usage,
  usagePct,
  subscriptionPlan,
}: {
  usage: DashboardData["usage"];
  usagePct: number;
  subscriptionPlan: UserSubscriptionPlan | null;
}) {
  const t = useTranslations("dashboard");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("kpi.monthlyCredits")}</CardTitle>
        <Zap className="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-bold">
          {(usage?.credits ?? 0).toLocaleString()}
          <span className="text-muted-foreground ml-1 text-sm font-normal">
            /{" "}
            {subscriptionPlan?.usageLimits?.monthlyRequests?.toLocaleString() ??
              "0"}
          </span>
        </p>
        <Progress
          value={usagePct}
          className={cn("h-1.5", usagePct > 80 && "[&>div]:bg-orange-500")}
        />
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-[11px]">
            {t("kpi.usedThisMonth", { pct: usagePct.toFixed(1) })}
          </p>
          <Link
            href="/dashboard/usage"
            className="text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-[11px] transition-colors"
          >
            {t("kpi.fullBreakdown")}
            <ArrowRight className="size-2.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyDashboard() {
  const t = useTranslations("dashboard");
  const { setIsOpen, setMode, setActiveConversationId } = useAssistantStore();

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMode("sidebar");
    setIsOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-muted mb-6 rounded-full p-4">
        <Bot className="text-muted-foreground size-8" />
      </div>
      <h2 className="text-lg font-semibold">{t("empty.title")}</h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        {t("empty.subtitle")}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button
          onClick={handleNewChat}
          className="flex w-auto items-center gap-2 whitespace-nowrap"
        >
          <Sparkles className="size-4" />
          {t("empty.startTask")}
        </Button>

        <Link href="/dashboard/workflows/new">
          <Button
            variant="outline"
            className="flex w-auto items-center gap-2 whitespace-nowrap"
          >
            <Workflow className="size-4" />
            {t("empty.createWorkflow")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-xl lg:col-span-2" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}
