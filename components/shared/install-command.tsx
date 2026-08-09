"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The command that starts the project, copyable in one click.
 *
 * A developer landing page earns more trust from a runnable line than from a
 * badge — this is the first thing a visitor actually does.
 */
export function InstallCommand({
  command,
  className,
}: {
  command: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy install command"
      className={cn(
        "group border-border bg-card/70 hover:border-primary/50 inline-flex max-w-full items-center gap-3 rounded-full border py-2 pr-2 pl-4 backdrop-blur transition-colors",
        className,
      )}
    >
      <span className="text-primary shrink-0 font-mono text-sm select-none">
        $
      </span>
      {/* Scrolls rather than wraps: a wrapped command would break the pill
          into two lines on a phone. min-w-0 is what lets a flex child shrink
          below its content width and actually overflow. */}
      <code className="text-foreground/90 scrollbar-none min-w-0 flex-1 overflow-x-auto text-left font-mono text-xs whitespace-nowrap sm:text-sm">
        {command}
      </code>
      <span className="bg-muted text-muted-foreground group-hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-full transition-colors">
        {copied ? (
          <Check className="text-primary size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </span>
    </button>
  );
}
