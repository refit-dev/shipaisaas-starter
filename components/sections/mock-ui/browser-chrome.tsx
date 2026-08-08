import { env } from "@/env.mjs";

interface BrowserChromeProps {
  /** Path to append to the app URL, e.g. "/dashboard/workflows" */
  path: string;
  children: React.ReactNode;
}

export function BrowserChrome({ path, children }: BrowserChromeProps) {
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  const displayUrl = `${new URL(appUrl).hostname}${path}`;

  return (
    <div className="border-border/60 overflow-hidden rounded-xl border shadow-2xl">
      {/* Title bar */}
      <div className="border-border/60 bg-muted/70 flex items-center gap-3 border-b px-3 py-1.5 backdrop-blur-sm">
        {/* macOS traffic lights */}
        <div className="flex shrink-0 items-center gap-1">
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
        </div>

        {/* URL bar */}
        <div className="flex flex-1 justify-center">
          <span className="text-muted-foreground truncate text-[11px]">
            {displayUrl}
          </span>
        </div>

        {/* Balance spacer equal to traffic lights width */}
        <div className="w-[46px] shrink-0" />
      </div>

      {children}
    </div>
  );
}
