"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAssistantStore } from "@/stores/assistantStore";
import { useUserStore } from "@/stores/userStore";
import { UserSubscriptionPlan } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
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

type RecentConversation = {
  id: string;
  title: string;
  updatedAt: string;
};

type DashboardData = {
  kpis: {
    totalConversations: number;
    conversationsThisWeek: number;
    totalMessages: number;
    requestsThisMonth: number;
  };
  recentConversations: RecentConversation[];
  activityChartData: { date: string; conversations: number }[];
  usage: {
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    credits: number;
  } | null;
};

// ---------------------------------------------------------------------------
// DashboardClient
// ---------------------------------------------------------------------------

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userSubscriptionPlan } = useUserStore();
  const { isOpen, mode } = useAssistantStore();
  const sidebarOpen = isOpen && mode === "sidebar";

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const isEmpty = !data || data.kpis.totalConversations === 0;
  if (isEmpty) return <EmptyDashboard />;

  const { kpis, recentConversations, activityChartData, usage } = data;
  const usagePct = usage
    ? Math.min(
        (usage.credits /
          (userSubscriptionPlan?.usageLimits?.monthlyRequests || 1)) *
          100,
        100,
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* ── KPI cards ──────────────────────────────────────────── */}
      <div
        className={cn("grid grid-cols-2 gap-4", !sidebarOpen && "lg:grid-cols-4")}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {kpis.totalConversations.toLocaleString()}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              All time with your assistant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This week</CardTitle>
            <Sparkles className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {kpis.conversationsThisWeek.toLocaleString()}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              New conversations in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <Bot className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {kpis.totalMessages.toLocaleString()}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Sent and received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Requests this month
            </CardTitle>
            <Zap className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {kpis.requestsThisMonth.toLocaleString()}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Counts against your plan limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Usage + activity ───────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <UsageGlance
          usage={usage}
          usagePct={usagePct}
          subscriptionPlan={userSubscriptionPlan}
        />

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Activity (last 30 days)
            </CardTitle>
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
                  dataKey="conversations"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent conversations ───────────────────────────────── */}
      {recentConversations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Recent conversations</h3>
          <div className="divide-y overflow-hidden rounded-lg border">
            {recentConversations.map((conversation) => (
              <ConversationFeedItem
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConversationFeedItem
// ---------------------------------------------------------------------------

function ConversationFeedItem({
  conversation,
}: {
  conversation: RecentConversation;
}) {
  const { setActiveConversationId, setActiveConversation, setMode, setIsOpen } =
    useAssistantStore();

  const handleOpen = () => {
    setActiveConversationId(conversation.id);
    setActiveConversation(conversation as any);
    setMode("sidebar");
    setIsOpen(true);
  };

  return (
    <button
      onClick={handleOpen}
      className="group hover:bg-muted/40 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
    >
      <MessageSquare className="text-muted-foreground size-3.5 shrink-0" />

      <p className="group-hover:text-accent-foreground min-w-0 flex-1 truncate text-xs font-medium transition-colors">
        {conversation.title}
      </p>

      <span className="text-muted-foreground hidden shrink-0 text-[11px] sm:block">
        {formatDistanceToNow(new Date(conversation.updatedAt), {
          addSuffix: true,
        })}
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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Monthly requests</CardTitle>
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
          className={cn("h-1.5", usagePct > 80 && "[&>div]:bg-destructive")}
        />
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-[11px]">
            {usagePct.toFixed(1)}% used this month
          </p>
          <Link
            href="/dashboard/usage"
            className="text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-[11px] transition-colors"
          >
            Full breakdown
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
      <h2 className="text-lg font-semibold">Nothing here yet</h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        Start a conversation with your assistant, or run one of the task
        templates to see activity here.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button
          onClick={handleNewChat}
          className="flex w-auto items-center gap-2 whitespace-nowrap"
        >
          <Sparkles className="size-4" />
          Start a chat
        </Button>

        <Link href="/dashboard/tasks">
          <Button
            variant="outline"
            className="flex w-auto items-center gap-2 whitespace-nowrap"
          >
            <Bot className="size-4" />
            Browse tasks
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
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl lg:col-span-2" />
      </div>
      <div className="grid gap-4">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
