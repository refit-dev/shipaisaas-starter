"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  PauseCircle,
  Workflow,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RunStatus =
  | "running"
  | "awaiting_approval"
  | "approved"
  | "completed"
  | "failed";

interface WorkflowRunningStateProps {
  status: RunStatus;
  workflowTitle?: string;
  workflowId?: number;
  currentStepDescription?: string;
  currentStepIndex?: number;
  totalSteps?: number;
}

// ---------------------------------------------------------------------------
// Config per status
// ---------------------------------------------------------------------------

function getConfig(status: RunStatus) {
  switch (status) {
    case "running":
      return {
        icon: <Loader2 className="size-5 animate-spin text-blue-500" />,
        title: "Workflow is running",
        description: "The agent is executing the next step automatically.",
        barClass: "bg-blue-500",
        animate: true,
      };
    case "awaiting_approval":
      return {
        icon: <PauseCircle className="size-5 text-amber-500" />,
        title: "Waiting for your approval",
        description:
          "The workflow has paused and sent you an email to review the latest output.",
        barClass: "bg-amber-400",
        animate: false,
      };
    case "approved":
      return {
        icon: <CheckCircle2 className="size-5 text-blue-500" />,
        title: "Workflow approved",
        description:
          "Your approval has been received. The workflow will continue.",
        barClass: "bg-blue-500",
        animate: false,
      };
    case "completed":
      return {
        icon: <CheckCircle2 className="size-5 text-green-500" />,
        title: "Workflow completed",
        description:
          "All steps finished successfully. Review the results above.",
        barClass: "bg-green-500",
        animate: false,
      };
    case "completed":
      return {
        icon: <CheckCircle2 className="size-5 text-green-500" />,
        title: "Workflow completed",
        description:
          "All steps finished successfully. Review the results above.",
        barClass: "bg-green-500",
        animate: false,
      };
    case "failed":
      return {
        icon: <XCircle className="size-5 text-red-500" />,
        title: "Workflow failed",
        description:
          "An error occurred during execution. Check the messages above for details.",
        barClass: "bg-red-500",
        animate: false,
      };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkflowRunningState({
  status,
  workflowTitle,
  workflowId,
  currentStepDescription,
  currentStepIndex,
  totalSteps,
}: WorkflowRunningStateProps) {
  const router = useRouter();
  const cfg = getConfig(status);

  const showProgress =
    typeof currentStepIndex === "number" &&
    typeof totalSteps === "number" &&
    totalSteps > 0;

  const progressPct = showProgress
    ? Math.round(((currentStepIndex! + 1) / totalSteps!) * 100)
    : null;

  return (
    <div className="border-t px-4 py-4">
      <div className="bg-muted/40 mx-auto flex w-full max-w-2xl flex-col gap-3 rounded-xl border p-4">
        {/* Top row: icon + title + workflow link */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {cfg.icon}
            <div>
              <p className="text-sm leading-none font-medium">{cfg.title}</p>
            </div>
          </div>

          {workflowId && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground h-7 gap-1.5 px-2 text-xs"
              onClick={() => router.push(`/dashboard/workflows/${workflowId}`)}
            >
              <Workflow className="size-3" />
              <span className="hidden sm:inline">View workflow</span>
              <ExternalLink className="size-3" />
            </Button>
          )}
        </div>

        {/* Progress bar + step info */}
        {showProgress && (
          <div className="space-y-1.5">
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  cfg.barClass,
                  cfg.animate && "animate-pulse",
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              {currentStepDescription && (
                <p className="text-muted-foreground truncate text-[11px]">
                  {currentStepDescription}
                </p>
              )}
              <span className="text-muted-foreground ml-auto shrink-0 font-mono text-[11px] tabular-nums">
                {currentStepIndex! + 1} / {totalSteps}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-muted-foreground text-xs leading-relaxed">
          {cfg.description}
        </p>
      </div>
    </div>
  );
}
