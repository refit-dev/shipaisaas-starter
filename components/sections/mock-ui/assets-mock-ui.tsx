import {
  Copy,
  Download,
  FileText,
  Hash,
  Image as ImageIcon,
  LayoutList,
  Search,
} from "lucide-react";

import { BrowserChrome } from "./browser-chrome";

// ---------------------------------------------------------------------------
// Mock data — 4 assets matching the real TYPE_CONFIG types
// ---------------------------------------------------------------------------

const MOCK_ASSETS = [
  {
    id: "1",
    label: "Social Post",
    Icon: Hash,
    platform: "LinkedIn",
    title: "AI Marketing Trends for 2026 — LinkedIn Carousel",
    preview:
      "The future of AI marketing isn't about automation — it's about amplification. Here are the 5 trends reshaping every B2B content strategy this year. 🧵",
    time: "2 hr ago",
    isImage: false,
  },
  {
    id: "2",
    label: "Image",
    Icon: ImageIcon,
    platform: undefined,
    title: "AI Marketing Hero Image",
    preview: null,
    time: "2 hr ago",
    isImage: true,
  },
  // {
  //   id: "3",
  //   label: "Outline",
  //   Icon: LayoutList,
  //   platform: "Blog",
  //   title: "Content Outline: The Future of Remote Work in 2026",
  //   preview:
  //     "1. The Async Revolution — why sync work is becoming optional\n2. Tools That Enable Deep Work\n3. Building Culture Without an Office\n4. Managing Performance Remotely",
  //   time: "1 day ago",
  //   isImage: false,
  // },
  // {
  //   id: "4",
  //   label: "Report",
  //   Icon: FileText,
  //   platform: undefined,
  //   title: "Competitor Pricing Analysis — Q2 2026",
  //   preview:
  //     "Analysis of 3 SaaS competitors reveals a market shift toward usage-based pricing. Our current flat-rate model may be leaving 18–24% ARR on the table based on churn patterns.",
  //   time: "3 days ago",
  //   isImage: false,
  // },
] as const;

// ---------------------------------------------------------------------------
// Type filter pills
// ---------------------------------------------------------------------------

const TYPE_PILLS = [
  { label: "All", count: 4, active: true },
  { label: "Social Post", count: 1, active: false },
  { label: "Image", count: 1, active: false },
  { label: "Outline", count: 1, active: false },
  { label: "Report", count: 1, active: false },
];

function TypePill({
  label,
  count,
  active,
}: {
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <span
      className={
        active
          ? "bg-primary text-primary-foreground border-primary flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium"
          : "bg-background text-muted-foreground border-border flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium"
      }
    >
      {label}
      <span
        className={
          active
            ? "bg-primary-foreground/20 rounded-full px-1 py-0.5 text-[9px] leading-none tabular-nums"
            : "bg-muted rounded-full px-1 py-0.5 text-[9px] leading-none tabular-nums"
        }
      >
        {count}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Asset card — mirrors the real AssetCard structure exactly
// ---------------------------------------------------------------------------

function AssetCard({
  label,
  Icon,
  platform,
  title,
  preview,
  time,
  isImage,
}: (typeof MOCK_ASSETS)[number]) {
  return (
    <div className="bg-card group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Header strip */}
      <div className="bg-muted flex items-center gap-2 px-3 py-2.5">
        <div className="bg-primary flex size-6 shrink-0 items-center justify-center rounded-md border">
          <Icon className="text-primary-foreground size-3" />
        </div>
        <span className="text-foreground text-[11px] font-semibold">
          {label}
        </span>
        {platform && (
          <span className="text-muted-foreground ml-auto shrink-0 text-[10px]">
            {platform}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 text-xs leading-snug font-medium">{title}</p>
        {isImage ? (
          <div className="from-primary/10 to-muted mt-1 h-24 w-full rounded-lg bg-gradient-to-br" />
        ) : (
          <p className="text-muted-foreground line-clamp-3 text-[11px] leading-relaxed whitespace-pre-line">
            {preview}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-3 py-2">
        <span className="text-muted-foreground text-[10px]">{time}</span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="hover:bg-muted rounded p-1 transition-colors">
            <Copy className="text-muted-foreground size-2.5" />
          </button>
          <button className="hover:bg-muted rounded p-1 transition-colors">
            <Download className="text-muted-foreground size-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AssetsMockUI() {
  return (
    <BrowserChrome path="/dashboard/assets">
      <div className="bg-background px-5 py-5">
        {/* Page header */}
        <div className="mb-4">
          <h1 className="text-foreground text-base font-bold tracking-tight">
            Asset Library
          </h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            All content generated by your AI agents in one place.
          </p>
        </div>

        {/* Type filter pills */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {TYPE_PILLS.map((p) => (
            <TypePill key={p.label} {...p} />
          ))}
        </div>

        {/* Search + time filter */}
        <div className="mb-4 flex gap-2">
          <div className="border-border bg-background relative flex flex-1 items-center gap-2 rounded-md border px-3 py-1.5">
            <Search className="text-muted-foreground size-3 shrink-0" />
            <span className="text-muted-foreground text-[11px]">
              Search by title or content…
            </span>
          </div>
          <div className="border-border bg-background flex items-center rounded-md border px-3 py-1.5">
            <span className="text-muted-foreground text-[11px]">All time</span>
          </div>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-3">
          {MOCK_ASSETS.map((asset) => (
            <AssetCard key={asset.id} {...asset} />
          ))}
        </div>
      </div>
    </BrowserChrome>
  );
}
