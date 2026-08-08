"use client";

import { UIMessage } from "ai";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

import { AnimatedStreamText } from "./animated-stream-text";

export function MessageItem({
  message,
  isLastMessage,
  status,
}: {
  message: UIMessage;
  isLastMessage: boolean;
  status: string;
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
          <Icons.bot className="text-foreground size-4" />
        </div>
      )}

      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-2",
          !isAssistant && "items-end",
        )}
      >
        {message.parts.map((part, index) => {
          if (part.type !== "text" || !part.text.trim()) return null;

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
        })}
      </div>
    </div>
  );
}
