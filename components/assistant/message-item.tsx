"use client";

import { useState } from "react";
import { useAssistantStore } from "@/stores/assistantStore";
import { UIMessage } from "ai";
import { AlertCircle, Check, Copy, Download, Loader2, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

import { AnimatedStreamText } from "./animated-stream-text";

export const TOOL_DESCRIPTIONS: Record<string, string> = {
  web_search:
    "The assistant wants to search the web for up-to-date information.",
  generate_image: "The assistant wants to generate a custom image.",
  format_post: "The assistant wants to format and finalize your post draft.",
  memory: "The assistant wants to read or write to your team memory.",
  generate_reel_script:
    "The assistant wants to generate a reel script structure.",
  format_reel: "The assistant wants to finalize the reel content package.",
  generate_script_outline:
    "The assistant wants to generate a script outline.",
  format_script: "The assistant wants to write the full script narration.",
  generate_thumbnail_concept:
    "The assistant wants to generate thumbnail design concepts.",
  extract_receipt_data:
    "The assistant wants to extract data from a receipt image.",
  read_document: "The assistant wants to read and parse a document.",
  analyze_legal_document:
    "The assistant wants to analyze the legal document content.",
  send_analysis_email:
    "The assistant wants to email the legal analysis to a client.",
};

function extractVideoUrl(output: unknown): string | null {
  if (!output || typeof output !== "object") return null;
  const values = Object.values(output as Record<string, unknown>);
  for (const v of values) {
    if (typeof v === "string" && v.match(/\.mp4(\?|$)/i)) return v;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Shared CopyButton
// ---------------------------------------------------------------------------

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text).catch(console.error);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      title="Copy to clipboard"
      className={cn(
        "flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {copied ? (
        <Check size={11} className="text-green-500" />
      ) : (
        <Copy size={11} />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Inline image with download
// ---------------------------------------------------------------------------

function InlineImage({ toolCall }: { toolCall: any }) {
  const out = (toolCall.output as any)?.value ?? toolCall.output;
  const imageUrl: string | undefined = out?.imageUrl;
  if (!imageUrl) return null;

  return (
    <div className="ml-2 mt-1 max-w-sm overflow-hidden rounded-lg border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Generated image"
        className="max-h-64 w-full object-contain"
      />
      <div className="border-border flex justify-end border-t px-2 py-1">
        <a
          href={imageUrl}
          download="generated-image.png"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] transition-colors"
        >
          <Download size={11} />
          Download
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline reel card with copy
// ---------------------------------------------------------------------------

function ReelCard({ toolCall }: { toolCall: any }) {
  const out = (toolCall.output as any)?.value ?? toolCall.output;
  if (!out?.title) return null;

  const copyText = [
    out.title,
    "",
    out.captionText,
    "",
    out.hashtags?.join(" "),
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="bg-card ml-2 mt-1 max-w-sm overflow-hidden rounded-lg border text-xs">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <p className="text-foreground font-semibold">{out.title}</p>
        <CopyButton text={copyText} />
      </div>
      <div className="p-3">
        {out.captionText && (
          <p className="text-muted-foreground mb-2 leading-relaxed">
            {out.captionText}
          </p>
        )}
        {out.scenes?.length > 0 && (
          <div className="border-border space-y-1 border-t pt-2">
            {out.scenes.map((s: any) => (
              <div key={s.sceneNumber} className="flex gap-2">
                <span className="text-muted-foreground shrink-0 font-mono">
                  S{s.sceneNumber}
                </span>
                <span className="text-foreground">{s.narration}</span>
              </div>
            ))}
          </div>
        )}
        {out.hashtags?.length > 0 && (
          <p className="text-primary mt-2 leading-relaxed">
            {out.hashtags.join(" ")}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline script card with copy
// ---------------------------------------------------------------------------

function ScriptCard({ toolCall }: { toolCall: any }) {
  const out = (toolCall.output as any)?.value ?? toolCall.output;
  if (!out?.title) return null;

  const copyText = [
    out.title,
    out.estimatedRuntime ? `Runtime: ${out.estimatedRuntime}` : "",
    "",
    ...(out.acts ?? []).flatMap((act: any) => [
      `## ${act.actTitle}`,
      ...(act.sections ?? []).map(
        (s: any) =>
          `[${s.timestamp}]${s.cue ? ` ${s.cue}` : ""}\n${s.narration}`,
      ),
      "",
    ]),
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  return (
    <div className="bg-card ml-2 mt-1 max-w-sm overflow-hidden rounded-lg border text-xs">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div>
          <p className="text-foreground font-semibold">{out.title}</p>
          {out.estimatedRuntime && (
            <p className="text-muted-foreground text-[10px]">
              {out.estimatedRuntime}
            </p>
          )}
        </div>
        <CopyButton text={copyText} />
      </div>
      <div className="max-h-64 space-y-2 overflow-y-auto p-3">
        {(out.acts ?? []).map((act: any, i: number) => (
          <div key={i}>
            <p className="text-foreground mb-1 font-medium">{act.actTitle}</p>
            {(act.sections ?? []).map((s: any, j: number) => (
              <div key={j} className="mb-1.5">
                <span className="text-muted-foreground font-mono">
                  [{s.timestamp}]
                </span>
                {s.cue && (
                  <span className="text-primary ml-1 italic">{s.cue}</span>
                )}
                <p className="text-muted-foreground mt-0.5 leading-relaxed">
                  {s.narration}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Receipt card
// ---------------------------------------------------------------------------

function ReceiptCard({ toolCall }: { toolCall: any }) {
  const out = (toolCall.output as any)?.value ?? toolCall.output;
  if (!out || out.error) return null;

  return (
    <div className="bg-card ml-2 mt-1 max-w-sm overflow-hidden rounded-lg border text-xs">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div>
          <p className="text-foreground font-semibold">
            {out.merchant ?? "Receipt"}
          </p>
          {out.date && (
            <p className="text-muted-foreground text-[10px]">{out.date}</p>
          )}
        </div>
        {out.total != null && (
          <span className="text-foreground font-mono font-semibold">
            {out.currency ? `${out.currency} ` : ""}
            {out.total}
          </span>
        )}
      </div>

      {out.items?.length > 0 && (
        <div className="max-h-48 space-y-1 overflow-y-auto p-3">
          {out.items.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-foreground flex-1 truncate">{item.name}</span>
              {item.quantity != null && (
                <span className="text-muted-foreground shrink-0">
                  ×{item.quantity}
                </span>
              )}
              {item.totalPrice != null && (
                <span className="text-foreground shrink-0 font-mono">
                  {item.totalPrice}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="border-t px-3 py-2 space-y-0.5">
        {out.subtotal != null && (
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono">{out.subtotal}</span>
          </div>
        )}
        {out.tax != null && (
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span className="font-mono">{out.tax}</span>
          </div>
        )}
        {out.tip != null && (
          <div className="flex justify-between text-muted-foreground">
            <span>Tip</span>
            <span className="font-mono">{out.tip}</span>
          </div>
        )}
        {out.total != null && (
          <div className="flex justify-between font-semibold text-foreground">
            <span>Total</span>
            <span className="font-mono">{out.total}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legal analysis card
// ---------------------------------------------------------------------------

function LegalAnalysisCard({ toolCall }: { toolCall: any }) {
  const out = (toolCall.output as any)?.value ?? toolCall.output;
  if (!out || out.error || !out.summary) return null;

  const riskBadge = (level: string) =>
    level === "high"
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      : level === "medium"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

  return (
    <div className="bg-card ml-2 mt-1 max-w-sm overflow-hidden rounded-lg border text-xs">
      <div className="border-b px-3 py-2">
        <p className="text-foreground font-semibold">
          {out.documentType ?? "Legal Document"}
        </p>
        <p className="text-muted-foreground mt-0.5 leading-relaxed">
          {out.summary}
        </p>
      </div>

      {out.risks?.length > 0 && (
        <div className="max-h-36 space-y-1 overflow-y-auto p-3">
          <p className="text-muted-foreground mb-1 font-medium">Risks</p>
          {out.risks.map((r: any, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium capitalize",
                  riskBadge(r.level),
                )}
              >
                {r.level}
              </span>
              <span className="text-muted-foreground flex-1 leading-relaxed">
                {r.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {out.recommendations?.length > 0 && (
        <div className="border-t px-3 py-2">
          <p className="text-muted-foreground mb-1 font-medium">
            Recommendations
          </p>
          <ul className="text-muted-foreground list-inside list-disc space-y-0.5">
            {out.recommendations.slice(0, 3).map((rec: string, i: number) => (
              <li key={i} className="leading-relaxed">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MessageItem
// ---------------------------------------------------------------------------

export function MessageItem({
  message,
  isLastMessage,
  status,
  addToolApprovalResponse,
}: {
  message: UIMessage;
  isLastMessage: boolean;
  status: string;
  addToolApprovalResponse: (response: any) => void;
}) {
  const isAssistant = message.role === "assistant";
  const isCurrentlyStreaming =
    isAssistant && isLastMessage && status === "streaming";

  return (
    <div
      className={cn("flex w-full gap-4", !isAssistant && "flex-row-reverse")}
    >
      {isAssistant && (
        <div className="bg-muted mt-1 flex size-8 shrink-0 items-center justify-center rounded-md border shadow-sm select-none">
          <Icons.agent className="text-foreground size-4" />
        </div>
      )}

      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-2",
          !isAssistant && "items-end",
        )}
      >
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            if (!part.text.trim()) return null;

            if (!isAssistant) {
              return (
                <div
                  key={index}
                  className="bg-muted text-foreground rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl px-4 py-2.5 text-sm leading-relaxed"
                >
                  <AnimatedStreamText
                    text={part.text}
                    isStreaming={false}
                    renderImages={true}
                  />
                </div>
              );
            }

            return (
              <div
                key={index}
                className="text-foreground rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl px-4 py-2.5 text-sm leading-relaxed"
              >
                <AnimatedStreamText
                  text={part.text}
                  isStreaming={isCurrentlyStreaming}
                />
              </div>
            );
          }

          if (part.type.startsWith("tool-")) {
            const toolName = part.type.replace("tool-", "");
            const toolPart = part as any;

            if (toolPart.state === "approval-responded") {
              return (
                <ApprovalResponseItem
                  key={toolPart.toolCallId}
                  toolName={toolName}
                  approved={toolPart.approval?.approved}
                />
              );
            }

            return (
              <ToolInvocationItem
                key={toolPart.toolCallId}
                toolCall={toolPart}
                state={toolPart.state}
                toolName={toolName}
                addToolApprovalResponse={addToolApprovalResponse}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToolInvocationItem
// ---------------------------------------------------------------------------

function ToolInvocationItem({
  toolName,
  toolCall,
  state,
  addToolApprovalResponse,
}: {
  toolName: string;
  toolCall: any;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error"
    | "approval-requested";
  addToolApprovalResponse: (response: any) => void;
}) {
  const toolApprovalStatus = useAssistantStore((s) => s.toolApprovalStatus);
  const activeConversation = useAssistantStore((s) => s.activeConversation);
  const [clickedButton, setClickedButton] = useState<"allow" | "deny" | null>(null);

  const isDone = state === "output-available";
  const isError = state === "output-error";
  const isLoading = state === "input-streaming" || state === "input-available";

  let showApprovalCard = true;
  if (
    activeConversation?.workflowRun &&
    (toolApprovalStatus === "idle" ||
      toolApprovalStatus === "approved" ||
      toolApprovalStatus === "rejected")
  ) {
    showApprovalCard = false;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Tool status row */}
      <div
        className={cn(
          "flex w-fit items-center gap-2 p-2 text-xs font-medium transition-colors",
          isError ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {isLoading && (
          <Icons.spinner className="text-primary size-3 animate-spin" />
        )}
        {isDone && <Icons.check className="text-primary size-3" />}
        {isError && <AlertCircle className="size-3" />}
        {state === "approval-requested" && (
          <ShieldCheck className="size-3 text-amber-500" />
        )}

        <span className="capitalize">{toolName?.replace(/_/g, " ")}</span>

        {isDone && <span className="text-[10px] opacity-70">(completed)</span>}
        {isError && <span className="text-[10px] opacity-70">(failed)</span>}
        {state === "approval-requested" && (
          <span className="text-[10px] opacity-70">(approval needed)</span>
        )}
      </div>

      {/* Approval card */}
      {state === "approval-requested" && showApprovalCard && (
        <div
          className={cn(
            "bg-card border-border ml-2 w-64 overflow-hidden rounded-lg border",
            toolApprovalStatus === "processing" && "opacity-80",
          )}
        >
          <div className="px-3 py-2">
            <p className="text-foreground text-xs font-medium">
              {TOOL_DESCRIPTIONS[toolName] ?? "Run this tool?"}
            </p>
          </div>
          <div className="border-border flex gap-1.5 border-t px-3 py-2">
            <button
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
              onClick={() => {
                setClickedButton("allow");
                addToolApprovalResponse({
                  id: toolCall.approval.id,
                  approved: true,
                });
              }}
              disabled={toolApprovalStatus === "processing"}
            >
              {clickedButton === "allow" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
              Allow
            </button>
            <button
              className="border-border text-muted-foreground hover:bg-muted flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
              onClick={() => {
                setClickedButton("deny");
                addToolApprovalResponse({
                  id: toolCall.approval.id,
                  approved: false,
                });
              }}
              disabled={toolApprovalStatus === "processing"}
            >
              {clickedButton === "deny" && (
                <Loader2 className="size-3 animate-spin" />
              )}
              Deny
            </button>
          </div>
        </div>
      )}

      {/* Inline image with download */}
      {isDone && toolName === "generate_image" && (
        <InlineImage toolCall={toolCall} />
      )}

      {/* Reel card with copy */}
      {isDone && toolName === "format_reel" && (
        <ReelCard toolCall={toolCall} />
      )}

      {/* Script card with copy */}
      {isDone && toolName === "format_script" && (
        <ScriptCard toolCall={toolCall} />
      )}

      {/* Receipt card */}
      {isDone && toolName === "extract_receipt_data" && (
        <ReceiptCard toolCall={toolCall} />
      )}

      {/* Legal analysis card */}
      {isDone && toolName === "analyze_legal_document" && (
        <LegalAnalysisCard toolCall={toolCall} />
      )}

      {/* Inline video */}
      {isDone && (() => {
        const out = (toolCall.output as any)?.value ?? toolCall.output;
        const videoUrl = extractVideoUrl(out);
        if (!videoUrl) return null;
        return (
          <video
            controls
            src={videoUrl}
            className="ml-2 mt-1 max-h-64 w-full max-w-sm rounded-lg border"
          >
            Your browser does not support the video tag.
          </video>
        );
      })()}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ApprovalResponseItem
// ---------------------------------------------------------------------------

function ApprovalResponseItem({
  toolName,
  approved,
}: {
  toolName: string;
  approved: boolean;
}) {
  return (
    <div className="flex w-fit items-center gap-2 px-3 py-1.5">
      {approved ? (
        <Check className="text-primary size-3" />
      ) : (
        <AlertCircle className="text-destructive size-3" />
      )}
      <span className="text-muted-foreground text-xs capitalize">
        {toolName.replace(/_/g, " ")}
      </span>
      <span
        className={cn(
          "text-[10px] font-medium",
          approved ? "text-primary" : "text-destructive",
        )}
      >
        {approved ? "allowed" : "denied"}
      </span>
    </div>
  );
}
