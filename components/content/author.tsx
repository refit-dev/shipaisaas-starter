import Link from "next/link";

import { BLOG_AUTHORS } from "@/config/blog";
import { getBlurDataURL } from "@/lib/utils";
import BlurImage from "@/components/shared/blur-image";

export default async function Author({
  username,
  imageOnly,
}: {
  username: string;
  imageOnly?: boolean;
}) {
  const authors = BLOG_AUTHORS;
  const authorData = authors[username as keyof typeof authors];

  if (!authorData) return null;

  return imageOnly ? (
    <div className="ring-background relative size-8 shrink-0 overflow-hidden rounded-full ring-2">
      <BlurImage
        src={authorData.image}
        alt={authorData.name}
        width={32}
        height={32}
        priority
        placeholder="blur"
        blurDataURL={await getBlurDataURL(authorData.image!)}
        className="size-full object-cover transition-all group-hover:brightness-90"
      />
    </div>
  ) : (
    <Link
      href={`https://twitter.com/${authorData.twitter}`}
      className="group border-border/60 bg-muted/20 hover:bg-muted/50 flex w-max items-center space-x-3 rounded-full border pr-4 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
        <BlurImage
          src={authorData.image}
          alt={authorData.name}
          width={40}
          height={40}
          priority
          placeholder="blur"
          blurDataURL={await getBlurDataURL(authorData.image!)}
          className="size-full object-cover transition-all group-hover:brightness-90"
        />
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-foreground text-sm font-medium tracking-tight">
          {authorData.name}
        </p>
        <p className="text-muted-foreground text-xs">@{authorData.twitter}</p>
      </div>
    </Link>
  );
}
