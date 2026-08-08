import { cn } from "@/lib/utils";

import { Icons } from "../shared/icons";

interface DocsPageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  text?: string;
  root?: string;
}

export function DocsPageHeader({
  heading,
  text,
  root = "Docs",
  className,
  ...props
}: DocsPageHeaderProps) {
  return (
    <>
      <div className="text-muted-foreground mb-4 flex items-center space-x-1 text-sm">
        <div className="truncate">{root}</div>
        <Icons.chevronRight className="size-4" />
        <div className="text-primary font-medium">{heading}</div>
      </div>

      <div className={cn("space-y-2", className)} {...props}>
        <h1 className="inline-block scroll-m-20 text-4xl">
          {heading}
        </h1>
        {text && (
          <p className="text-muted-foreground text-lg text-balance">{text}</p>
        )}
      </div>
    </>
  );
}
