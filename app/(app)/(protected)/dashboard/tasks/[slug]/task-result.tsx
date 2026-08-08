"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Download, Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { TaskTemplate } from "@/config/tasks";
import { Button } from "@/components/ui/button";

export default function TaskResult({
  template,
  resultText,
  resultImage,
  isLoading,
}: {
  template: TaskTemplate;
  resultText: string | null;
  resultImage: string | null;
  isLoading: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const isImageTask = template.outputType === "image";

  const copyToClipboard = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    setIsDownloading(true);
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${template.slug}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(resultImage, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="lg:col-span-7">
      <div className="bg-card flex h-full min-h-[500px] flex-col overflow-hidden rounded-xl border shadow-sm">
        <div className="bg-muted/50 flex items-center justify-between border-b p-4">
          <h3 className="text-muted-foreground flex items-center text-sm font-semibold">
            Generated {isImageTask ? "Image" : "Output"}
          </h3>
          {!isImageTask && resultText && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="h-8"
            >
              {copied ? (
                <CheckCircle2 className="mr-2 size-3 text-emerald-500" />
              ) : (
                <Copy className="mr-2 size-3" />
              )}
              {copied ? "Copied!" : "Copy Text"}
            </Button>
          )}
          {isImageTask && resultImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="h-8"
            >
              {isDownloading ? (
                <Loader2 className="mr-2 size-3 animate-spin" />
              ) : (
                <Download className="mr-2 size-3" />
              )}
              {isDownloading ? "Downloading..." : "Download Image"}
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center space-y-4">
              <Loader2 className="size-8 animate-spin text-indigo-500" />
              <p className="animate-pulse text-sm">
                Crafting your {isImageTask ? "image" : "content"}...
              </p>
            </div>
          ) : isImageTask && resultImage ? (
            <div className="flex h-full items-center justify-center">
              <div className="bg-muted relative aspect-square w-full max-w-md overflow-hidden rounded-lg border shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultImage}
                  alt="AI Generated"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : !isImageTask && resultText ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown remarkPlugins={[remarkGfm]}>{resultText}</Markdown>
            </div>
          ) : (
            <div className="text-muted-foreground border-muted m-4 flex h-full items-center justify-center rounded-lg border-2 border-dashed p-8 text-center text-sm">
              Fill out the form and click generate to see the results here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
