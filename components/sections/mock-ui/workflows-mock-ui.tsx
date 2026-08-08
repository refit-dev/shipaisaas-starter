import {
  CalendarClock,
  CheckCircle2,
  FileEdit,
  PauseCircle,
  Plus,
  XCircle,
} from "lucide-react";

import { BrowserChrome } from "./browser-chrome";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type RunStatus =
  | "running"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "draft";

type MockWorkflow = {
  id: string;
  title: string;
  goal: string;
  schedule: boolean;
  stepCount: number;
  runNumber: number | null;
  updatedAt: string;
  runStatus: RunStatus;
};

const MOCK_WORKFLOWS: MockWorkflow[] = [
  {
    id: "1",
    title: "LinkedIn AI Trends Carousel",
    goal: "Search for top 5 AI marketing trends, generate an outline, and draft a 6-slide carousel with hook and CTA",
    schedule: true,
    stepCount: 5,
    runNumber: 12,
    updatedAt: "2 min ago",
    runStatus: "running",
  },
  {
    id: "2",
    title: "Competitor Pricing Report",
    goal: "Extract pricing pages from 3 SaaS competitors and generate a structured competitive analysis report",
    schedule: false,
    stepCount: 4,
    runNumber: 3,
    updatedAt: "8 min ago",
    runStatus: "awaiting_approval",
  },
  {
    id: "3",
    title: "Weekly Newsletter Digest",
    goal: "Find the 5 most-discussed AI stories this week and format them into a ready-to-send newsletter edition",
    schedule: true,
    stepCount: 6,
    runNumber: 8,
    updatedAt: "1 hr ago",
    runStatus: "completed",
  },
  {
    id: "4",
    title: "Cold Outreach Lead List",
    goal: "Find Series B SaaS companies from the last 90 days, extract value propositions, and build an outreach summary",
    schedule: false,
    stepCount: 3,
    runNumber: null,
    updatedAt: "3 days ago",
    runStatus: "draft",
  },
  {
    id: "5",
    title: "Instagram Caption Batch",
    goal: "Research sustainable fashion trends this month and draft 5 ready-to-publish captions with hashtags",
    schedule: false,
    stepCount: 4,
    runNumber: 1,
    updatedAt: "30 min ago",
    runStatus: "failed",
  },
];

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: RunStatus }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-blue-600 px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap text-white">
        <span className="relative flex size-1.5 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-white" />
        </span>
        Running
      </span>
    );
  }
  if (status === "awaiting_approval") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-amber-400 px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap text-amber-950">
        <PauseCircle className="size-3 shrink-0 text-amber-950" />
        Needs approval
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-green-600 px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap text-white">
        <CheckCircle2 className="size-3 shrink-0 text-white" />
        Completed
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-red-600 px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap text-white">
        <XCircle className="size-3 shrink-0 text-white" />
        Failed
      </span>
    );
  }
  return (
    <span className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap">
      <FileEdit className="size-3 shrink-0" />
      Draft
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkflowsMockUI() {
  return (
    <BrowserChrome path="/dashboard/workflows">
      <div className="bg-background flex">
        {/* Slim sidebar strip */}
        <div className="border-border/60 bg-muted/30 hidden w-14 shrink-0 flex-col items-center gap-3 border-r py-4 sm:flex">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={
                i === 1
                  ? "bg-primary/20 ring-primary/30 size-6 rounded-md ring-1"
                  : "bg-border/40 size-6 rounded-md"
              }
            />
          ))}
        </div>

        {/* Main panel */}
        <div className="min-w-0 flex-1 overflow-hidden px-5 py-5">
          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-foreground text-base font-semibold">
                Workflows
              </h1>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Monitor long-running AI tasks and approve pending plans.
              </p>
            </div>
            <button className="bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium">
              <Plus className="size-3.5" />
              New Workflow
            </button>
          </div>

          {/* List */}
          <div className="mt-5">
            {/* Column headers */}
            <div className="text-muted-foreground mb-1 grid grid-cols-[minmax(140px,1fr)_148px_100px_76px] items-center gap-4 px-3 text-[10px] font-semibold tracking-widest uppercase">
              <span>Workflow</span>
              <span>Status</span>
              <span>Updated</span>
              <span className="text-right">Steps</span>
            </div>

            {/* Rows */}
            <div className="divide-border divide-y overflow-hidden rounded-lg border">
              {MOCK_WORKFLOWS.map((wf) => (
                <div
                  key={wf.id}
                  className="bg-card grid grid-cols-[minmax(140px,1fr)_148px_100px_76px] items-center gap-4 px-3 py-3"
                >
                  {/* Title + goal */}
                  <div className="min-w-0 overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-medium">{wf.title}</p>
                      {wf.schedule && (
                        <CalendarClock className="text-muted-foreground size-2.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                      {wf.goal}
                    </p>
                  </div>

                  {/* Status pill */}
                  <div className="flex">
                    <StatusBadge status={wf.runStatus} />
                  </div>

                  {/* Date + run */}
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[11px]">
                      {wf.updatedAt}
                    </span>
                    {wf.runNumber !== null && (
                      <span className="text-muted-foreground text-[10px] tabular-nums">
                        Run #{wf.runNumber}
                      </span>
                    )}
                  </div>

                  {/* Step count */}
                  <span className="text-muted-foreground text-right font-mono text-[11px] tabular-nums">
                    {wf.stepCount} steps
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
}
