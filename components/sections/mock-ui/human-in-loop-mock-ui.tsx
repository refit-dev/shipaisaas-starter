"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Loader2,
  PauseCircle,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { BrowserChrome } from "./browser-chrome";

// ---------------------------------------------------------------------------
// Phase state machine
// ---------------------------------------------------------------------------

type Phase = "pending" | "processing" | "resuming" | "done";

const PHASE_DURATIONS: Record<Phase, number> = {
  pending: 2800,
  processing: 900,
  resuming: 2000,
  done: 2200,
};

const PHASE_ORDER: Phase[] = ["pending", "processing", "resuming", "done"];

// ---------------------------------------------------------------------------
// Sub-components mirroring the real tool invocation UI
// ---------------------------------------------------------------------------

function ToolRow({
  label,
  state,
}: {
  label: string;
  state: "done" | "loading";
}) {
  return (
    <div className="flex w-fit items-center gap-2 p-2 text-xs font-medium text-muted-foreground">
      {state === "loading" ? (
        <Loader2 className="text-primary size-3 animate-spin" />
      ) : (
        <Check className="text-primary size-3" />
      )}
      <span className="capitalize">{label}</span>
      {state === "done" && (
        <span className="text-[10px] opacity-70">(completed)</span>
      )}
    </div>
  );
}

function FormatPostTool({ phase }: { phase: Phase }) {
  const isProcessing = phase === "processing";
  const isApproved = phase === "resuming" || phase === "done";

  return (
    <div className="flex flex-col gap-1.5">
      {/* Tool status row */}
      <div className="flex w-fit items-center gap-2 p-2 text-xs font-medium text-muted-foreground">
        {isApproved ? (
          <Check className="text-primary size-3" />
        ) : (
          <ShieldCheck className="size-3 text-amber-500" />
        )}
        <span>Format post</span>
        {isApproved ? (
          <span className="text-[10px] opacity-70">(completed)</span>
        ) : (
          <span className="text-[10px] opacity-70">(approval needed)</span>
        )}
      </div>

      {/* Approval card */}
      {!isApproved && (
        <div
          className={cn(
            "bg-card border-border ml-2 w-64 overflow-hidden rounded-lg border transition-opacity duration-300",
            isProcessing && "opacity-60",
          )}
        >
          <div className="px-3 py-2">
            <p className="text-foreground text-xs font-medium">
              Ready to write the LinkedIn carousel. Allow this step to run?
            </p>
          </div>
          <div className="border-border flex gap-1.5 border-t px-3 py-2">
            <button
              className={cn(
                "bg-primary text-primary-foreground flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                isProcessing && "opacity-70",
              )}
              tabIndex={-1}
            >
              {isProcessing ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
              Allow
            </button>
            <button
              className="border-border text-muted-foreground rounded-md border px-3 py-1.5 text-xs"
              tabIndex={-1}
            >
              Deny
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Mirrors the WorkflowRunningState card from the real component
function StatusCard({ phase }: { phase: Phase }) {
  const configs = {
    pending: {
      icon: <PauseCircle className="size-4 text-amber-500" />,
      title: "Waiting for your approval",
      desc: "The workflow has paused and sent you an email to review the latest output.",
      barClass: "bg-amber-400",
      barWidth: "60%",
      animate: false,
    },
    processing: {
      icon: <PauseCircle className="size-4 text-amber-500" />,
      title: "Processing approval…",
      desc: "Submitting your response and resuming the workflow.",
      barClass: "bg-amber-400",
      barWidth: "60%",
      animate: true,
    },
    resuming: {
      icon: <Loader2 className="size-4 animate-spin text-blue-500" />,
      title: "Workflow is running",
      desc: "The agent is executing the next step automatically.",
      barClass: "bg-blue-500",
      barWidth: "80%",
      animate: true,
    },
    done: {
      icon: <CheckCircle2 className="size-4 text-green-500" />,
      title: "Workflow completed",
      desc: "All steps finished successfully. Review the results above.",
      barClass: "bg-green-500",
      barWidth: "100%",
      animate: false,
    },
  };

  const cfg = configs[phase];

  return (
    <div className="border-t px-4 py-3">
      <div className="bg-muted/40 flex flex-col gap-2.5 rounded-xl border p-3.5">
        <div className="flex items-center gap-2">
          {cfg.icon}
          <p className="text-sm font-medium leading-none">{cfg.title}</p>
          <span className="text-muted-foreground ml-auto font-mono text-[10px] tabular-nums">
            Run #4 · 4/5 steps
          </span>
        </div>

        {/* Progress bar */}
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              cfg.barClass,
              cfg.animate && "animate-pulse",
            )}
            style={{ width: cfg.barWidth }}
          />
        </div>

        <p className="text-muted-foreground text-[11px] leading-relaxed">
          {cfg.desc}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function HumanInLoopMockUI() {
  const [phase, setPhase] = useState<Phase>("pending");

  useEffect(() => {
    const duration = PHASE_DURATIONS[phase];
    const t = setTimeout(() => {
      const idx = PHASE_ORDER.indexOf(phase);
      setPhase(PHASE_ORDER[(idx + 1) % PHASE_ORDER.length]);
    }, duration);
    return () => clearTimeout(t);
  }, [phase]);

  const showGenerateImage = phase === "resuming" || phase === "done";

  return (
    <BrowserChrome path="/dashboard/workflows/4">
      <div className="bg-background flex h-[490px] flex-col md:h-[460px]">
        {/* Workflow title bar */}
        <div className="border-border/60 flex items-center gap-2 border-b px-4 py-2.5">
          <span className="text-foreground text-sm font-medium">
            LinkedIn AI Trends Carousel
          </span>
          <span className="text-muted-foreground ml-auto text-[11px]">
            Step 4 of 5
          </span>
        </div>

        {/* Chat thread */}
        <div className="flex-1 overflow-hidden px-4 py-4">
          <div className="flex flex-col gap-0.5">
            {/* User message */}
            <div className="mb-3 flex justify-end">
              <div className="bg-primary text-primary-foreground max-w-[78%] rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed">
                Create a LinkedIn carousel about AI marketing trends for 2026.
                Include a strong hook and CTA.
              </div>
            </div>

            {/* Tool steps */}
            <ToolRow label="web search" state="done" />
            <ToolRow label="generate outline" state="done" />
            <FormatPostTool phase={phase} />

            {/* generate_image appears after approval */}
            <div
              className={cn(
                "transition-all duration-500",
                showGenerateImage
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-1 opacity-0",
              )}
            >
              <ToolRow
                label="generate image"
                state={phase === "done" ? "done" : "loading"}
              />
            </div>

            {/* Completion message */}
            <div
              className={cn(
                "mt-2 flex items-start gap-2 transition-all duration-500",
                phase === "done"
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-1 opacity-0",
              )}
            >
              <div className="bg-card border-border rounded-2xl rounded-tl-sm border px-3 py-2 text-xs leading-relaxed">
                Your LinkedIn carousel is ready. The post and hero image have
                been saved to your asset library.
              </div>
            </div>
          </div>
        </div>

        {/* WorkflowRunningState card — pinned to bottom */}
        <StatusCard phase={phase} />
      </div>
    </BrowserChrome>
  );
}
