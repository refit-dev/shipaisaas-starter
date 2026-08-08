"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Check,
  Copy,
  Download,
  FileText,
  Hash,
  Image as ImageIcon,
  LayoutList,
  Receipt,
  Scale,
  Search,
  Video,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Asset = {
  id: number;
  type: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type TypeConfig = {
  label: string;
  Icon: React.ElementType;
  canCopy: boolean;
  canDownload: boolean;
};

// ---------------------------------------------------------------------------
// Type config — icons and labels only; all colors come from theme tokens
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<string, TypeConfig> = {
  social_post: {
    label: "Social Post",
    Icon: Hash,
    canCopy: true,
    canDownload: true,
  },
  post_outline: {
    label: "Outline",
    Icon: LayoutList,
    canCopy: true,
    canDownload: true,
  },
  image: { label: "Image", Icon: ImageIcon, canCopy: false, canDownload: true },
  reel_script: {
    label: "Reel Script",
    Icon: Video,
    canCopy: true,
    canDownload: true,
  },
  script: { label: "Script", Icon: FileText, canCopy: true, canDownload: true },
  thumbnail: {
    label: "Thumbnail",
    Icon: ImageIcon,
    canCopy: true,
    canDownload: true,
  },
  receipt: {
    label: "Receipt",
    Icon: Receipt,
    canCopy: true,
    canDownload: true,
  },
  legal_analysis: {
    label: "Legal Analysis",
    Icon: Scale,
    canCopy: true,
    canDownload: true,
  },
};

const DEFAULT_CONFIG: TypeConfig = {
  label: "Asset",
  Icon: FileText,
  canCopy: true,
  canDownload: true,
};

function getConfig(type: string): TypeConfig {
  return TYPE_CONFIG[type] ?? { ...DEFAULT_CONFIG, label: type };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

function downloadAsset(asset: Asset, e: React.MouseEvent) {
  e.stopPropagation();
  if (asset.type === "image") {
    const a = document.createElement("a");
    a.href = asset.content;
    a.download = `${asset.title}.png`;
    a.target = "_blank";
    a.click();
    return;
  }
  const blob = new Blob([asset.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${asset.title}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Asset Card
// ---------------------------------------------------------------------------

function AssetCard({ asset, onClick }: { asset: Asset; onClick: () => void }) {
  const cfg = getConfig(asset.type);
  const { copied, copy } = useCopy(asset.content);
  const platform = asset.metadata?.platform as string | undefined;

  return (
    <div
      onClick={onClick}
      className="group bg-card relative flex cursor-pointer flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Header strip */}
      <div className="bg-muted flex items-center gap-2.5 px-4 py-3">
        <div className="bg-primary flex size-7 shrink-0 items-center justify-center rounded-lg border">
          <cfg.Icon className="text-primary-foreground size-3.5" />
        </div>
        <span className="text-foreground text-xs font-semibold">
          {cfg.label}
        </span>
        {platform && (
          <span className="text-muted-foreground ml-auto shrink-0 text-[10px]">
            {platform}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="line-clamp-2 text-sm leading-snug font-medium">
          {asset.title}
        </p>
        {asset.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.content}
            alt={asset.title}
            className="mt-1 h-36 w-full rounded-lg object-cover"
          />
        ) : (
          <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
            {asset.content}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-4 py-2.5">
        <span className="text-muted-foreground text-[11px]">
          {relativeTime(asset.createdAt)}
        </span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {cfg.canCopy && (
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={copy}
              title="Copy"
            >
              {copied ? (
                <Check className="text-primary size-3" />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
          )}
          {cfg.canDownload && (
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={(e) => downloadAsset(asset, e)}
              title="Download"
            >
              <Download className="size-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail dialog
// ---------------------------------------------------------------------------

function AssetDialog({
  asset,
  onClose,
}: {
  asset: Asset | null;
  onClose: () => void;
}) {
  const cfg = asset ? getConfig(asset.type) : DEFAULT_CONFIG;
  const { copied, copy } = useCopy(asset?.content ?? "");

  return (
    <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="bg-muted px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex size-9 items-center justify-center rounded-lg border">
              <cfg.Icon className="text-primary-foreground size-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate text-base">
                {asset?.title}
              </DialogTitle>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {cfg.label}
                {asset && ` · ${relativeTime(asset.createdAt)}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {asset?.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset.content}
              alt={asset.title}
              className="w-full rounded-lg object-contain"
            />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-foreground mt-5 mb-3 text-xl font-bold first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-foreground mt-4 mb-2 text-base font-semibold first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-foreground mt-3 mb-1.5 text-sm font-semibold first:mt-0">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-foreground mb-3 text-sm leading-relaxed last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="text-foreground mb-3 list-disc space-y-1 pl-5 text-sm last:mb-0">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-foreground mb-3 list-decimal space-y-1 pl-5 text-sm last:mb-0">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-foreground leading-relaxed">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="text-foreground font-semibold">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="text-muted-foreground italic">{children}</em>
                ),
                code: ({ children }) => (
                  <code className="bg-muted text-foreground rounded px-1 py-0.5 font-mono text-xs">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted mb-3 overflow-x-auto rounded-lg p-3 text-xs">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-border text-muted-foreground mb-3 border-l-2 pl-3 text-sm italic">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="border-border my-4" />,
                table: ({ children }) => (
                  <div className="mb-3 overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border-border bg-muted border px-3 py-1.5 text-left text-xs font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border-border border px-3 py-1.5 text-xs">
                    {children}
                  </td>
                ),
              }}
            >
              {asset?.content ?? ""}
            </ReactMarkdown>
          )}
        </div>

        <div className="flex items-center gap-2 border-t px-6 py-4">
          {cfg.canCopy && (
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? (
                <Check className="text-primary mr-1.5 size-3.5" />
              ) : (
                <Copy className="mr-1.5 size-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
          {cfg.canDownload && asset && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => downloadAsset(asset, e)}
            >
              <Download className="mr-1.5 size-3.5" />
              Download
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Type filter pill
// ---------------------------------------------------------------------------

function TypePill({
  label,
  Icon,
  count,
  active,
  onClick,
}: {
  label: string;
  Icon?: React.ElementType;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30",
      )}
    >
      {Icon && <Icon className="size-3" />}
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] leading-none tabular-nums",
          active ? "bg-primary-foreground/20" : "bg-muted",
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="bg-muted h-12 animate-pulse" />
      <div className="space-y-2 p-4">
        <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
        <div className="bg-muted h-3 w-full animate-pulse rounded" />
        <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
      </div>
      <div className="border-t px-4 py-3">
        <div className="bg-muted h-3 w-16 animate-pulse rounded" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Time range config
// ---------------------------------------------------------------------------

const TIME_RANGES = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
];

function getFromDate(range: string): string | undefined {
  const now = new Date();
  if (range === "today") {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  if (range === "week") {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }
  if (range === "month") {
    now.setDate(now.getDate() - 30);
    return now.toISOString();
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [selected, setSelected] = useState<Asset | null>(null);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeType !== "all") params.set("type", activeType);
      const from = getFromDate(timeRange);
      if (from) params.set("from", from);

      const res = await fetch(`/api/assets?${params}`);
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch {
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeType, timeRange]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q),
    );
  }, [assets, search]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: assets.length };
    for (const a of assets) counts[a.type] = (counts[a.type] ?? 0) + 1;
    return counts;
  }, [assets]);

  const availableTypes = useMemo(
    () => Array.from(new Set(assets.map((a) => a.type))),
    [assets],
  );

  const hasFilters = search || activeType !== "all";

  return (
    <div className="flex min-h-full flex-col space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Asset Library</h2>
          <p className="text-muted-foreground text-sm">
            All content generated by your AI agents in one place.
          </p>
        </div>
      </div>

      {/* Type filter pills */}
      {(availableTypes.length > 0 || !isLoading) && (
        <div className="flex flex-wrap gap-2">
          <TypePill
            label="All"
            count={typeCounts.all ?? 0}
            active={activeType === "all"}
            onClick={() => setActiveType("all")}
          />
          {availableTypes.map((type) => {
            const cfg = getConfig(type);
            return (
              <TypePill
                key={type}
                label={cfg.label}
                Icon={cfg.Icon}
                count={typeCounts[type] ?? 0}
                active={activeType === type}
                onClick={() => setActiveType(type)}
              />
            );
          })}
        </div>
      )}

      {/* Search + time filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-8 pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="bg-muted flex size-16 items-center justify-center rounded-full">
            <Archive className="size-7 opacity-40" />
          </div>
          <div className="space-y-1">
            <p className="text-foreground font-medium">No assets found</p>
            <p className="text-sm opacity-70">
              {search
                ? "Try a different search term."
                : "Assets are saved automatically when agents produce content."}
            </p>
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setActiveType("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {search && (
            <p className="text-muted-foreground -mt-2 text-xs">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for
              &ldquo;{search}&rdquo;
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onClick={() => setSelected(asset)}
              />
            ))}
          </div>
        </>
      )}

      <AssetDialog asset={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
