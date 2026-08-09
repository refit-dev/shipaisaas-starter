import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Post } from "contentlayer/generated";

import { cn, formatDate, placeholderBlurhash } from "@/lib/utils";
import BlurImage from "@/components/shared/blur-image";

export function BlogCard({
  data,
  priority,
  horizontale = false,
}: {
  data: Post & { blurDataURL: string };
  priority?: boolean;
  horizontale?: boolean;
}) {
  return (
    <article
      className={cn(
        "group border-border bg-card hover:border-primary/40 relative flex flex-col overflow-hidden rounded-2xl border transition-colors duration-200",
        horizontale ? "md:flex-row md:items-stretch" : "",
      )}
    >
      {/* Thumbnail */}
      {data.image && (
        <div
          className={cn(
            "relative shrink-0 overflow-hidden bg-muted/20",
            horizontale
              ? "aspect-[4/3] w-full border-b border-border md:aspect-auto md:w-2/5 md:border-r md:border-b-0"
              : "aspect-[16/9] w-full border-b border-border",
          )}
        >
          <BlurImage
            alt={data.title}
            blurDataURL={data.blurDataURL ?? placeholderBlurhash}
            className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            width={800}
            height={400}
            priority={priority}
            placeholder="blur"
            src={data.image}
            sizes="(max-width: 768px) 750px, 600px"
          />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "flex flex-1 flex-col",
          horizontale ? "p-6 md:p-8" : "p-5",
        )}
      >
        {/* Date */}
        {data.date && (
          <p className="text-muted-foreground mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">
            {formatDate(data.date)}
          </p>
        )}

        {/* Title */}
        <h2
          className={cn(
            "text-foreground mb-2.5 tracking-tight",
            horizontale
              ? "font-display text-2xl leading-snug font-extrabold tracking-[-0.02em] sm:text-3xl"
              : "line-clamp-2 text-base leading-snug font-semibold",
          )}
        >
          {data.title}
        </h2>

        {/* Description */}
        {data.description && (
          <p
            className={cn(
              "text-muted-foreground flex-1 leading-relaxed",
              horizontale ? "line-clamp-3 text-base" : "line-clamp-2 text-sm",
            )}
          >
            {data.description}
          </p>
        )}

        {/* Read link */}
        <div className="mt-5 flex items-center gap-1">
          <span className="text-primary text-xs font-semibold uppercase tracking-[0.15em]">
            Read
          </span>
          <ArrowUpRight className="text-primary size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      <Link href={data.slug} className="absolute inset-0">
        <span className="sr-only">View Article: {data.title}</span>
      </Link>
    </article>
  );
}
