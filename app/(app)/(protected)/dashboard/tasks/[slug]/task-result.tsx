"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";

export default function TaskResult({
  result,
  isLoading,
}: {
  result: string | null;
  isLoading: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lg:col-span-7">
      <div className="bg-card flex h-full min-h-[500px] flex-col overflow-hidden rounded-xl border shadow-sm">
        <div className="bg-muted/50 flex items-center justify-between border-b p-4">
          <h3 className="text-muted-foreground flex items-center text-sm font-semibold">
            Generated Output
          </h3>
          {result && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="h-8"
            >
              {copied ? (
                <CheckCircle2 className="text-primary mr-2 size-3" />
              ) : (
                <Copy className="mr-2 size-3" />
              )}
              {copied ? "Copied!" : "Copy Text"}
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center space-y-4">
              <Loader2 className="text-primary size-8 animate-spin" />
              <p className="animate-pulse text-sm">Crafting your content...</p>
            </div>
          ) : result ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown remarkPlugins={[remarkGfm]}>{result}</Markdown>
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
