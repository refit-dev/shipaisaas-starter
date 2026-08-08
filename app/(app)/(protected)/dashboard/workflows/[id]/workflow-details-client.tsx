"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssistantStore } from "@/stores/assistantStore";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Loader2,
  MessageSquare,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  RefreshCw,
  Save,
  Square,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";

import { WORKFLOW_TOOL_CONFIG } from "@/lib/ai/workflows/tool-config";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkflowStep = {
  id: number;
  stepIndex: number;
  description: string;
  toolName: string;
  requiresApproval: boolean;
  approvalPrompt: string | null;
};

type WorkflowRun = {
  id: number;
  runNumber: number;
  status: "running" | "awaiting_approval" | "approved" | "completed" | "failed";
  conversationId: number;
  currentStepIndex: number;
  createdAt: string;
  updatedAt: string;
};

type WorkflowDetail = {
  id: number;
  title: string;
  goal: string;
  status: "draft" | "active" | "archived";
  schedule: string | null;
  notificationEmail: string;
  createdAt: string;
  workflowSteps: WorkflowStep[];
  workflowRuns: WorkflowRun[];
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function runStatusConfig(status: WorkflowRun["status"]) {
  switch (status) {
    case "running":
      return {
        label: "Running",
        className: "bg-blue-600 text-white border-transparent",
        dotClass: "bg-white",
        Icon: PlayCircle,
        pulse: true,
      };
    case "awaiting_approval":
      return {
        label: "Needs approval",
        className: "bg-amber-400 text-amber-950 border-transparent",
        dotClass: "bg-amber-950",
        Icon: PauseCircle,
        pulse: false,
      };
    case "approved":
      return {
        label: "Approved",
        className: "bg-green-400 text-green-950 border-transparent",
        dotClass: "bg-green-950",
        Icon: CheckCircle2,
        pulse: false,
      };
    case "completed":
      return {
        label: "Completed",
        className: "bg-green-600 text-white border-transparent",
        dotClass: "bg-white",
        Icon: CheckCircle2,
        pulse: false,
      };
    case "failed":
      return {
        label: "Failed",
        className: "bg-red-600 text-white border-transparent",
        dotClass: "bg-white",
        Icon: XCircle,
        pulse: false,
      };
  }
}

function toolBadgeLabel(toolName: string) {
  return WORKFLOW_TOOL_CONFIG.find((t) => t.name === toolName)?.label ?? toolName;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkflowDetailClient({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const { setIsOpen, setMode, setActiveConversationId } = useAssistantStore();

  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggeringRun, setIsTriggeringRun] = useState(false);
  const [stoppingRunId, setStoppingRunId] = useState<number | null>(null);

  // Edit plan state
  const [isEditing, setIsEditing] = useState(false);
  const [draftSteps, setDraftSteps] = useState<WorkflowStep[]>([]);
  const [isSavingSteps, setIsSavingSteps] = useState(false);

  // Approve state
  const [isApprovingPlan, setIsApprovingPlan] = useState(false);

  // ------------------------------------------------------------------
  // Fetch
  // ------------------------------------------------------------------

  const fetchWorkflow = async () => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}`);
      if (res.ok) setWorkflow(await res.json());
    } catch (err) {
      console.error("Failed to load workflow:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, [workflowId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkflow((current) => {
        const hasActiveRun = current?.workflowRuns.some(
          (r) =>
            r.status === "running" ||
            r.status === "awaiting_approval" ||
            r.status === "approved",
        );
        const isDraft = current?.status === "draft";

        if (hasActiveRun || isDraft) fetchWorkflow();
        return current;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [workflowId]);

  // ------------------------------------------------------------------
  // Run actions
  // ------------------------------------------------------------------

  const handleOpenChat = (conversationId: number) => {
    setActiveConversationId(String(conversationId));
    setMode("sidebar");
    setIsOpen(true);
  };

  const handleTriggerRun = async () => {
    setIsTriggeringRun(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/run`, {
        method: "POST",
      });
      if (res.ok) {
        const { conversationId } = await res.json();
        await fetchWorkflow();
        handleOpenChat(conversationId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTriggeringRun(false);
    }
  };

  const handleStopRun = async (runId: number) => {
    setStoppingRunId(runId);
    try {
      await fetch(`/api/workflows/${workflowId}/runs/${runId}/stop`, {
        method: "POST",
      });
      await fetchWorkflow();
    } catch (err) {
      console.error("Failed to stop run:", err);
    } finally {
      setStoppingRunId(null);
    }
  };

  // ------------------------------------------------------------------
  // Plan edit actions
  // ------------------------------------------------------------------

  const enterEditMode = () => {
    if (!workflow) return;
    setDraftSteps(
      [...workflow.workflowSteps].sort((a, b) => a.stepIndex - b.stepIndex),
    );
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const moveStep = (i: number, dir: "up" | "down") => {
    const next = [...draftSteps];
    const swap = dir === "up" ? i - 1 : i + 1;
    [next[i], next[swap]] = [next[swap], next[i]];
    setDraftSteps(next);
  };

  const removeStep = (i: number) =>
    setDraftSteps(draftSteps.filter((_, idx) => idx !== i));

  const addStep = () =>
    setDraftSteps([
      ...draftSteps,
      {
        id: -Date.now(),
        stepIndex: draftSteps.length,
        description: "",
        toolName: "llm_response",
        requiresApproval: false,
        approvalPrompt: null,
      },
    ]);

  const updateStep = (
    i: number,
    field: keyof WorkflowStep,
    value: string | boolean | null,
  ) => {
    const next = [...draftSteps];
    next[i] = { ...next[i], [field]: value };
    setDraftSteps(next);
  };

  const saveSteps = async () => {
    setIsSavingSteps(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/steps`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: draftSteps }),
      });
      if (res.ok) {
        await fetchWorkflow();
        setIsEditing(false);
      }
    } finally {
      setIsSavingSteps(false);
    }
  };

  // ------------------------------------------------------------------
  // Approve action
  // ------------------------------------------------------------------

  const handleApprovePlan = async () => {
    setIsApprovingPlan(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/approve`, {
        method: "POST",
      });
      if (res.ok) await fetchWorkflow();
    } finally {
      setIsApprovingPlan(false);
    }
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-muted-foreground size-4 animate-spin" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">
        Workflow not found.
      </div>
    );
  }

  const isActive = workflow.status === "active";
  const isDraft = workflow.status === "draft";
  const activeRun = workflow.workflowRuns.find(
    (r) => r.status === "running" || r.status === "awaiting_approval",
  );
  const sortedRuns = [...workflow.workflowRuns].sort(
    (a, b) => b.runNumber - a.runNumber,
  );
  const sortedSteps = [...workflow.workflowSteps].sort(
    (a, b) => a.stepIndex - b.stepIndex,
  );

  return (
    <div className="mt-6 space-y-5">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <Link href={"/dashboard/workflows"}>
          <button className="group text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Workflows
          </button>
        </Link>

        <div className="flex items-center gap-2">
          {/* Approve button — only for draft workflows */}
          {isDraft && (
            <Button
              size="sm"
              onClick={handleApprovePlan}
              disabled={isApprovingPlan || isEditing}
              className="gap-1.5"
            >
              {isApprovingPlan ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              Approve Plan
            </Button>
          )}

          {/* Open active run */}
          {activeRun && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenChat(activeRun.conversationId)}
              className="gap-1.5"
            >
              <MessageSquare className="size-3.5" />
              View active run
            </Button>
          )}

          {/* Trigger new run */}
          {isActive && !activeRun && (
            <Button
              size="sm"
              onClick={handleTriggerRun}
              disabled={isTriggeringRun}
              className="gap-1.5"
            >
              {isTriggeringRun ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <PlayCircle className="size-3.5" />
              )}
              Run now
            </Button>
          )}
        </div>
      </div>

      {/* ── Goal ─────────────────────────────────────────────── */}
      <div className="bg-card rounded-lg border px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
            Goal
          </p>
          <div className="flex items-center gap-2">
            {workflow.schedule && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <CalendarClock className="size-3" />
                {workflow.schedule}
              </span>
            )}
            <WorkflowStatusBadge status={workflow.status} />
          </div>
        </div>
        <p className="text-sm leading-relaxed">{workflow.goal}</p>
      </div>

      {/* ── Plan steps ───────────────────────────────────────── */}
      <div className="bg-card overflow-hidden rounded-lg border">
        {/* Card header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <span className="text-sm font-semibold">
            Plan
            <span className="text-muted-foreground ml-1.5 font-normal">
              {isEditing ? draftSteps.length : sortedSteps.length} steps
            </span>
          </span>

          {isDraft && !isEditing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={enterEditMode}
              className="h-7 gap-1.5 px-2 text-xs"
            >
              <Pencil className="size-3" />
              Edit
            </Button>
          )}

          {isEditing && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelEdit}
                className="h-7 px-2 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveSteps}
                disabled={isSavingSteps}
                className="h-7 gap-1 px-2 text-xs"
              >
                {isSavingSteps ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Save className="size-3" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>

        {/* View mode */}
        {!isEditing && (
          <ol className="divide-y">
            {sortedSteps.map((step, i) => (
              <li key={step.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="border-border text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold tabular-nums">
                  {i + 1}
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-sm leading-snug">{step.description}</p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="bg-muted/60 text-muted-foreground flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px]">
                      <Wrench className="size-2.5" />
                      {toolBadgeLabel(step.toolName)}
                    </span>

                    {step.requiresApproval && (
                      <span className="flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
                        <PauseCircle className="size-2.5" />
                        Pauses for approval
                      </span>
                    )}
                  </div>

                  {step.approvalPrompt && (
                    <p className="text-muted-foreground text-[11px] italic">
                      "{step.approvalPrompt}"
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        {/* Edit mode */}
        {isEditing && (
          <div className="divide-y">
            {draftSteps.map((step, i) => (
              <div
                key={step.id}
                className="flex items-start gap-2 px-4 py-3"
              >
                {/* Move buttons */}
                <div className="mt-1 flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveStep(i, "up")}
                    disabled={i === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(i, "down")}
                    disabled={i === draftSteps.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>

                {/* Index */}
                <div className="border-border text-muted-foreground mt-2 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold tabular-nums">
                  {i + 1}
                </div>

                {/* Fields */}
                <div className="min-w-0 flex-1 space-y-2">
                  <Textarea
                    value={step.description}
                    onChange={(e) =>
                      updateStep(i, "description", e.target.value)
                    }
                    placeholder="Describe what this step should do…"
                    rows={2}
                    className="text-sm resize-none"
                  />

                  <select
                    value={step.toolName}
                    onChange={(e) => updateStep(i, "toolName", e.target.value)}
                    className="border-input bg-background text-foreground w-full rounded-md border px-2 py-1.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {WORKFLOW_TOOL_CONFIG.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  disabled={draftSteps.length === 1}
                  className="text-muted-foreground hover:text-destructive mt-2 shrink-0 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Remove step"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}

            {/* Add step */}
            <div className="px-4 py-3">
              <button
                type="button"
                onClick={addStep}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
              >
                <Plus className="size-3.5" />
                Add step
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Runs history ─────────────────────────────────────── */}
      <div className="bg-card overflow-hidden rounded-lg border">
        <div className="border-b px-5 py-3">
          <span className="text-sm font-semibold">
            Runs
            <span className="text-muted-foreground ml-1.5 font-normal">
              {workflow.workflowRuns.length} total
            </span>
          </span>
        </div>

        {sortedRuns.length === 0 ? (
          <div className="text-muted-foreground px-5 py-8 text-center text-sm">
            No runs yet.{" "}
            {isActive
              ? "Click 'Run now' to start the first run."
              : "Approve the workflow to enable runs."}
          </div>
        ) : (
          <div className="divide-y">
            {sortedRuns.map((run) => {
              const cfg = runStatusConfig(run.status);
              const isLive =
                run.status === "running" ||
                run.status === "awaiting_approval" ||
                run.status === "approved";
              const isStopping = stoppingRunId === run.id;

              return (
                <div
                  key={run.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <span className="text-muted-foreground w-12 shrink-0 font-mono text-xs tabular-nums">
                    #{run.runNumber}
                  </span>

                  <div className="flex min-w-[130px] shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] leading-none font-semibold whitespace-nowrap",
                        cfg.className,
                      )}
                    >
                      {cfg.pulse ? (
                        <span className="relative flex size-1.5 shrink-0">
                          <span
                            className={cn(
                              "absolute inline-flex size-full animate-ping rounded-full opacity-60",
                              cfg.dotClass,
                            )}
                          />
                          <span
                            className={cn(
                              "relative inline-flex size-1.5 rounded-full",
                              cfg.dotClass,
                            )}
                          />
                        </span>
                      ) : (
                        <cfg.Icon className="size-3 shrink-0" />
                      )}
                      {cfg.label}
                    </span>
                  </div>

                  <span className="text-muted-foreground hidden text-xs sm:block">
                    Step {run.currentStepIndex + 1} of{" "}
                    {workflow.workflowSteps.length}
                  </span>

                  <span className="text-muted-foreground ml-auto hidden text-xs lg:block">
                    {formatDistanceToNow(new Date(run.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>

                  <div className="flex shrink-0 items-center gap-1">
                    {isLive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                        onClick={() => handleStopRun(run.id)}
                        disabled={isStopping}
                        title="Stop this run"
                      >
                        {isStopping ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Square className="size-3 fill-current" />
                        )}
                        <span className="hidden sm:inline">
                          {isStopping ? "Stopping…" : "Stop"}
                        </span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant={isLive ? "default" : "ghost"}
                      className={cn(
                        "h-7 gap-1.5 px-2 text-xs",
                        !isLive && "text-muted-foreground",
                      )}
                      onClick={() => handleOpenChat(run.conversationId)}
                    >
                      <MessageSquare className="size-3.5" />
                      <span className="hidden sm:inline">
                        {isLive ? "View live" : "View chat"}
                      </span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WorkflowStatusBadge
// ---------------------------------------------------------------------------

function WorkflowStatusBadge({ status }: { status: WorkflowDetail["status"] }) {
  const map = {
    draft: {
      label: "Draft",
      className: "border-border text-muted-foreground",
    },
    active: {
      label: "Active",
      className:
        "border-green-300 text-green-700 dark:border-green-800 dark:text-green-400",
    },
    archived: {
      label: "Archived",
      className: "border-border text-muted-foreground",
    },
  };

  const cfg = map[status] ?? map.draft;

  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}
