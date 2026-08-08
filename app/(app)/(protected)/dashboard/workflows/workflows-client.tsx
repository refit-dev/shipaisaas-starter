"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileEdit,
  Loader2,
  PauseCircle,
  PlayCircle,
  Plus,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Workflow = {
  id: number;
  title: string;
  goal: string;
  status: "draft" | "active" | "archived";
  schedule: string | null;
  notificationEmail: string;
  createdAt: string;
  // Joined from latest workflowRun — optional, present when a run exists
  latestRun?: {
    id: number;
    runNumber: number;
    status:
      | "running"
      | "awaiting_approval"
      | "approved"
      | "completed"
      | "failed";
    conversationId: number;
    updatedAt: string;
  } | null;
  stepCount?: number;
};

type StatusConfig = {
  label: string;
  badge: string;
  iconClass: string;
  dotClass: string;
  Icon: React.ElementType;
  pulse: boolean;
};

// ---------------------------------------------------------------------------
// Status config
// Two-level status: workflow-level (draft/active/archived) and
// run-level (running/awaiting_approval/completed/failed).
// Run status takes precedence when a run exists.
// ---------------------------------------------------------------------------

function getStatusConfig(workflow: Workflow): StatusConfig {
  const run = workflow.latestRun;

  // Active workflow with a live run — show the run's status
  if (run) {
    switch (run.status) {
      case "running":
        return {
          label: "Running",
          badge: "bg-blue-600 text-white border-transparent",
          iconClass: "text-white",
          dotClass: "bg-white",
          Icon: PlayCircle,
          pulse: true,
        };
      case "awaiting_approval":
        return {
          label: "Needs approval",
          badge: "bg-amber-400 text-amber-950 border-transparent",
          iconClass: "text-amber-950",
          dotClass: "bg-amber-950",
          Icon: PauseCircle,
          pulse: false,
        };
      case "completed":
        return {
          label: "Completed",
          badge: "bg-green-600 text-white border-transparent",
          iconClass: "text-white",
          dotClass: "bg-white",
          Icon: CheckCircle2,
          pulse: false,
        };
      case "failed":
        return {
          label: "Failed",
          badge: "bg-red-600 text-white border-transparent",
          iconClass: "text-white",
          dotClass: "bg-white",
          Icon: XCircle,
          pulse: false,
        };
    }
  }

  // No run yet — show workflow-level status
  switch (workflow.status) {
    case "draft":
      return {
        label: "Draft",
        badge: "bg-secondary text-secondary-foreground border-transparent",
        iconClass: "text-secondary-foreground",
        dotClass: "bg-secondary-foreground",
        Icon: FileEdit,
        pulse: false,
      };
    case "active":
      return {
        label: "Ready",
        badge: "bg-secondary text-secondary-foreground border-transparent",
        iconClass: "text-secondary-foreground",
        dotClass: "bg-secondary-foreground",
        Icon: Clock,
        pulse: false,
      };
    case "archived":
      return {
        label: "Archived",
        badge: "bg-secondary text-secondary-foreground border-transparent",
        iconClass: "text-secondary-foreground",
        dotClass: "bg-secondary-foreground",
        Icon: Archive,
        pulse: false,
      };
    default:
      return {
        label: workflow.status,
        badge: "bg-secondary text-secondary-foreground border-transparent",
        iconClass: "text-secondary-foreground",
        dotClass: "bg-secondary-foreground",
        Icon: Clock,
        pulse: false,
      };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkflowsClient() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch("/api/workflows");
      if (res.ok) setWorkflows(await res.json());
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    // Poll every 5s to pick up run status changes (running → completed etc.)
    const intervalId = setInterval(fetchWorkflows, 5000);
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-muted-foreground size-4 animate-spin" />
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="workflow" />
        <EmptyPlaceholder.Title>No workflows yet</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          Workflows run automatically on a schedule or on demand — create one to
          get started.
        </EmptyPlaceholder.Description>
        <Link href="/dashboard/workflows/new">
          <Button className="mt-4 flex cursor-pointer items-center gap-2">
            <Plus className="size-4" />
            Create workflow
          </Button>
        </Link>
      </EmptyPlaceholder>
    );
  }

  return (
    <div className="mt-6">
      {/* Column headers */}
      <div className="text-muted-foreground mb-1 hidden items-center gap-4 px-4 text-[11px] font-semibold tracking-widest uppercase sm:grid sm:grid-cols-[minmax(0,1fr)_160px_130px] lg:grid-cols-[minmax(0,1fr)_160px_130px_120px]">
        <span>Workflow</span>
        <span>Status</span>
        <span>Updated</span>
        <span className="hidden text-right lg:block">Steps</span>
      </div>

      <div className="divide-y overflow-hidden rounded-lg border">
        {workflows.map((workflow) => {
          const { label, badge, iconClass, dotClass, Icon, pulse } =
            getStatusConfig(workflow);

          // Prefer run's updatedAt for recency, fall back to workflow createdAt
          const displayDate =
            workflow.latestRun?.updatedAt ?? workflow.createdAt;

          const runLabel = workflow.latestRun
            ? `Run #${workflow.latestRun.runNumber}`
            : null;

          // Active runs link to the conversation, otherwise to workflow detail
          const href = `/dashboard/workflows/${workflow.id}`;

          return (
            <Link
              key={workflow.id}
              href={href}
              className="group bg-card hover:bg-muted/40 flex w-full min-w-0 flex-col gap-2.5 px-4 py-3.5 transition-colors sm:grid sm:grid-cols-[minmax(0,1fr)_160px_130px] sm:items-center sm:gap-4 lg:grid-cols-[minmax(0,1fr)_160px_130px_120px]"
            >
              {/* Title + goal */}
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-center gap-2">
                  <p className="group-hover:text-primary truncate text-sm font-medium transition-colors">
                    {workflow.title}
                  </p>
                  {workflow.schedule && (
                    <CalendarClock className="text-muted-foreground size-3 shrink-0" />
                  )}
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs sm:line-clamp-none sm:truncate">
                  {workflow.goal}
                </p>
              </div>

              {/* Status + date — stacked inline on mobile */}
              <div className="flex items-center justify-between sm:contents">
                {/* Status pill */}
                <div className="flex">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] leading-none font-semibold whitespace-nowrap",
                      badge,
                    )}
                  >
                    {pulse ? (
                      <span className="relative flex size-1.5 shrink-0">
                        <span
                          className={cn(
                            "absolute inline-flex size-full animate-ping rounded-full opacity-60",
                            dotClass,
                          )}
                        />
                        <span
                          className={cn(
                            "relative inline-flex size-1.5 rounded-full",
                            dotClass,
                          )}
                        />
                      </span>
                    ) : (
                      <Icon className={cn("size-3 shrink-0", iconClass)} />
                    )}
                    {label}
                  </span>
                </div>

                {/* Date + run label */}
                <div className="flex flex-col items-end sm:items-start">
                  <span className="text-muted-foreground text-xs">
                    {displayDate
                      ? formatDistanceToNow(new Date(displayDate), {
                          addSuffix: true,
                        })
                      : "—"}
                  </span>
                  {runLabel && (
                    <span className="text-muted-foreground text-[11px] tabular-nums">
                      {runLabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Step count */}
              <span className="text-muted-foreground hidden text-right font-mono text-xs tabular-nums lg:block">
                {workflow.stepCount != null
                  ? `${workflow.stepCount} steps`
                  : "—"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
