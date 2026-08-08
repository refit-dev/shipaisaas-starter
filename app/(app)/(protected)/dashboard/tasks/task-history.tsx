"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { TASK_TEMPLATES } from "@/config/tasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TaskHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reusable secure download logic
  // TODO: Update this to handle different file types and edge cases as needed
  const handleDownload = async (id: number, url: string, filename: string) => {
    setDownloadingId(id);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${filename}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed, opening in new tab", error);
      window.open(url, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  // Helper to get the human-readable title from the slug
  const getTaskTitle = (slug: string) => {
    const template = TASK_TEMPLATES.find((t) => t.slug === slug);
    return template ? template.title : "Custom Task";
  };

  if (isLoading) {
    return (
      <div className="mt-12 flex h-32 items-center justify-center border-t pt-12">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (history.length === 0) return null;

  return (
    <div className="mt-16 space-y-4">
      <div className="flex items-center gap-2 border-b pb-4">
        <Clock className="text-muted-foreground size-5" />
        <h2 className="text-xl font-semibold tracking-tight">
          Recent Generations
        </h2>
      </div>

      <div className="grid gap-3">
        {history.map((item) => {
          // Parse assets safely (handle case where old DB rows might not have assets array)
          const assets = Array.isArray(item.assets) ? item.assets : [];
          const imageAsset = assets.find((a: any) => a.type === "image");

          return (
            <div
              key={item.id}
              className="bg-card hover:bg-muted/50 flex flex-col justify-between gap-4 rounded-lg border p-4 transition-all sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-col gap-1 overflow-hidden">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-sm font-semibold">
                    {getTaskTitle(item.taskSlug)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    •{" "}
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-muted-foreground line-clamp-2 min-w-0 text-sm">
                  {imageAsset
                    ? "Visual asset generated successfully."
                    : item.output.replace(/[#*`_]/g, "").substring(0, 100) +
                      "..."}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedTask(item)}
                >
                  <Eye className="mr-2 size-4" />
                  View
                </Button>
                {/* Conditional UI: Download Image OR Copy Text */}
                {imageAsset ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(item.id, imageAsset.url, item.taskSlug)
                    }
                    disabled={downloadingId === item.id}
                  >
                    {downloadingId === item.id ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 size-4" />
                    )}
                    {downloadingId === item.id ? "Downloading..." : "Download"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(item.id, item.output)}
                  >
                    {copiedId === item.id ? (
                      <CheckCircle2 className="mr-2 size-4 text-emerald-500" />
                    ) : (
                      <Copy className="mr-2 size-4" />
                    )}
                    {copiedId === item.id ? "Copied" : "Copy"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      <Dialog
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      >
        <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTask && getTaskTitle(selectedTask.taskSlug)}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted/30 mt-2 flex-1 overflow-auto rounded-md border p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown remarkPlugins={[remarkGfm]}>
                {selectedTask?.output}
              </Markdown>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            {/* Conditional Render: Copy or Download */}
            {selectedTask &&
            selectedTask.assets &&
            selectedTask.assets.some((a: any) => a.type === "image") ? (
              <Button
                variant="outline"
                onClick={() => {
                  // Handle download logic
                  handleDownload(
                    selectedTask.id,
                    selectedTask.assets.find((a: any) => a.type === "image")
                      ?.url,
                    selectedTask.taskSlug,
                  );
                  setSelectedTask(null); // Optional: close modal on download
                }}
              >
                Download Image
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  copyToClipboard(selectedTask.id, selectedTask.output);
                  setSelectedTask(null); // Optional: close modal on copy
                }}
              >
                Copy Text
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
