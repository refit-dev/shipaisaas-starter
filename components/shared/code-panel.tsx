import { cn } from "@/lib/utils";

type Token = { text: string; tone?: "key" | "string" | "comment" | "fn" };

export type CodeLine = Token[];

const TONE: Record<NonNullable<Token["tone"]>, string> = {
  key: "text-primary",
  fn: "text-foreground font-medium",
  string: "text-muted-foreground",
  comment: "text-muted-foreground/60 italic",
};

/**
 * A small code window used as a visual on marketing pages.
 *
 * Deliberately hand-tokenised rather than run through a highlighter: the
 * snippets are short, and this keeps a syntax-highlighting bundle off the
 * landing page.
 */
export function CodePanel({
  filename,
  lines,
  className,
}: {
  filename: string;
  lines: CodeLine[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-background/60 overflow-hidden rounded-2xl border backdrop-blur",
        className,
      )}
    >
      <div className="border-border bg-muted/40 flex items-center gap-2 border-b px-4 py-2.5">
        <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
        <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
        <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
        <span className="text-muted-foreground ml-2 font-mono text-[11px]">
          {filename}
        </span>
      </div>

      <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed sm:text-xs">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre">
              {line.length === 0 ? (
                <>&nbsp;</>
              ) : (
                line.map((token, j) => (
                  <span
                    key={j}
                    className={token.tone ? TONE[token.tone] : "text-foreground/80"}
                  >
                    {token.text}
                  </span>
                ))
              )}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
