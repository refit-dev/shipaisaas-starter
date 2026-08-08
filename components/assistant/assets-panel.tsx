"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  Hash,
  Image as ImageIcon,
  LayoutList,
  Loader2,
  Receipt,
  Scale,
  Video,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AssetType = "social_post" | "post_outline" | "image" | string;

type Asset = {
  id: number;
  type: AssetType;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Config per type
// ---------------------------------------------------------------------------

function assetTypeConfig(type: AssetType) {
  switch (type) {
    case "social_post":
      return { label: "Post", Icon: Hash, canCopy: true, canDownload: true };
    case "post_outline":
      return {
        label: "Outline",
        Icon: LayoutList,
        canCopy: true,
        canDownload: true,
      };
    case "image":
      return {
        label: "Image",
        Icon: ImageIcon,
        canCopy: false,
        canDownload: true,
      };
    case "reel_script":
      return {
        label: "Reel Script",
        Icon: Video,
        canCopy: true,
        canDownload: true,
      };
    case "script":
      return {
        label: "Script",
        Icon: FileText,
        canCopy: true,
        canDownload: true,
      };
    case "thumbnail":
      return {
        label: "Thumbnail",
        Icon: ImageIcon,
        canCopy: true,
        canDownload: true,
      };
    case "receipt":
      return {
        label: "Receipt",
        Icon: Receipt,
        canCopy: true,
        canDownload: true,
      };
    case "legal_analysis":
      return {
        label: "Legal Analysis",
        Icon: Scale,
        canCopy: true,
        canDownload: true,
      };
    default:
      return { label: type, Icon: FileText, canCopy: true, canDownload: true };
  }
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useCopyToClipboard(text: string) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Copy failed");
    }
  };

  return { copied, copy };
}

// ---------------------------------------------------------------------------
// Individual asset card
// ---------------------------------------------------------------------------

function AssetCard({ asset }: { asset: Asset }) {
  const cfg = assetTypeConfig(asset.type);
  const { copied, copy } = useCopyToClipboard(asset.content);

  const handleDownload = () => {
    if (asset.type === "image") {
      const a = document.createElement("a");
      a.href = asset.content;
      a.download = `${asset.title}.png`;
      a.target = "_blank";
      a.click();
      return;
    }

    // Text-based download
    const ext = asset.type === "post_outline" ? "json" : "txt";
    const blob = new Blob([asset.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${asset.title}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const platform = asset.metadata?.platform as string | undefined;

  return (
    <div className="bg-card w-full overflow-hidden rounded-lg border">
      {/* Header */}
      <div className="flex w-full items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <cfg.Icon className="text-muted-foreground size-3.5 shrink-0" />
          <span className="text-xs font-medium">{asset.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {platform && (
            <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px]">
              {platform}
            </span>
          )}
          {cfg.canCopy && (
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={copy}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="size-3 text-green-500" />
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
              onClick={handleDownload}
              title="Download"
            >
              <Download className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {asset.type === "image" ? (
        <div className="bg-muted/40 flex items-center justify-center p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.content}
            alt={asset.title}
            className="max-h-48 w-full rounded object-contain"
          />
        </div>
      ) : (
        <pre className="text-muted-foreground max-h-48 overflow-y-auto px-3 py-2.5 text-xs leading-relaxed break-words whitespace-pre-wrap">
          {asset.content}
        </pre>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Type filter tabs
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  all: "All",
  social_post: "Posts",
  post_outline: "Outlines",
  image: "Images",
  reel_script: "Reel Scripts",
  script: "Scripts",
  thumbnail: "Thumbnails",
  receipt: "Receipts",
  legal_analysis: "Legal Analyses",
};

// ---------------------------------------------------------------------------
// AssetsPanel
// ---------------------------------------------------------------------------

export function AssetsPanel({ conversationId }: { conversationId: string }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState("all");

  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/assets?conversationId=${conversationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) setAssets(data);
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  // Derive available filter tabs from actual data
  const availableTypes = [
    "all",
    ...Array.from(new Set(assets.map((a) => a.type))),
  ];

  const filtered =
    activeType === "all" ? assets : assets.filter((a) => a.type === activeType);

  return (
    <div className="flex h-full flex-col">
      {/* Filter tabs */}
      {availableTypes.length > 2 && (
        <div className="flex gap-1 border-b px-3 py-2">
          {availableTypes.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                activeType === t
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-muted-foreground flex h-32 flex-col items-center justify-center gap-2 text-center text-xs">
              <FileText className="size-6 opacity-40" />
              <span>No assets yet.</span>
              <span className="opacity-60">
                Assets are saved automatically when the agent produces content.
              </span>
            </div>
          ) : (
            filtered.map((asset) => <AssetCard key={asset.id} asset={asset} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
