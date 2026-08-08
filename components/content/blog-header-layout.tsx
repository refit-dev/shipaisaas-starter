"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, List } from "lucide-react";
import { Drawer } from "vaul";

import { BLOG_CATEGORIES } from "@/config/blog";
import { cn } from "@/lib/utils";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export function BlogHeaderLayout() {
  const [open, setOpen] = useState(false);
  const { slug } = useParams() as { slug?: string };
  const data = BLOG_CATEGORIES.find((category) => category.slug === slug);

  const closeDrawer = () => setOpen(false);

  return (
    <>
      <div className="bg-muted border-b border-border">
        <MaxWidthWrapper className="py-16 md:py-20">
          {/* Heading */}
          <p className="text-primary mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">
            Blog
          </p>
          <h1 className="text-foreground font-display text-3xl font-bold tracking-[-0.02em] text-balance md:text-4xl lg:text-5xl">
            {data?.title ?? "Latest news & updates."}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg text-sm leading-relaxed md:text-base">
            {data?.description ?? "Tutorials, release notes, and deep-dives from the Ship AI SaaS team."}
          </p>

          {/* Desktop category tabs */}
          <nav className="mt-10 hidden md:flex">
            <ul
              role="list"
              className="flex w-full flex-1 gap-x-1 border-b border-border text-[13px] font-medium text-muted-foreground"
            >
              <CategoryLink title="All" href="/blog" active={!slug} />
              {BLOG_CATEGORIES.map((category) => (
                <CategoryLink
                  key={category.slug}
                  title={category.title}
                  href={`/blog/category/${category.slug}`}
                  active={category.slug === slug}
                />
              ))}
            </ul>
          </nav>
        </MaxWidthWrapper>
      </div>

      {/* Mobile drawer trigger */}
      <Drawer.Root open={open} onClose={closeDrawer}>
        <Drawer.Trigger
          onClick={() => setOpen(true)}
          className="border-b border-border bg-muted/30 text-foreground/80 mb-8 flex w-full items-center p-4 md:hidden"
        >
          <List className="size-4" />
          <p className="ml-2.5 text-xs font-semibold uppercase tracking-[0.15em]">
            Browse Categories
          </p>
        </Drawer.Trigger>
        <Drawer.Overlay
          className="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm"
          onClick={closeDrawer}
        />
        <Drawer.Portal>
          <Drawer.Content className="border-t border-border bg-background fixed inset-x-0 bottom-0 z-50 mt-24 overflow-hidden rounded-t-[16px] shadow-2xl">
            <div className="bg-background sticky top-0 z-20 flex w-full items-center justify-center pt-3 pb-2">
              <div className="bg-muted-foreground/20 h-1 w-10 rounded-full" />
            </div>
            <ul role="list" className="mb-10 w-full space-y-px p-4">
              <CategoryLink
                title="All"
                href="/blog"
                active={!slug}
                clickAction={closeDrawer}
                mobile
              />
              {BLOG_CATEGORIES.map((category) => (
                <CategoryLink
                  key={category.slug}
                  title={category.title}
                  href={`/blog/category/${category.slug}`}
                  active={category.slug === slug}
                  clickAction={closeDrawer}
                  mobile
                />
              ))}
            </ul>
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

const CategoryLink = ({
  title,
  href,
  active,
  mobile = false,
  clickAction,
}: {
  title: string;
  href: string;
  active: boolean;
  mobile?: boolean;
  clickAction?: () => void;
}) => {
  return (
    <Link href={href} onClick={clickAction}>
      {mobile ? (
        <li
          className={cn(
            "transition-colors",
            active
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-muted",
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 text-sm font-medium">
            <span>{title}</span>
            {active && <Check className="size-3.5" />}
          </div>
        </li>
      ) : (
        <li
          className={cn(
            "-mb-px border-b-2 border-transparent px-3 pb-3 transition-colors hover:text-foreground",
            active ? "border-primary text-foreground" : "",
          )}
        >
          {title}
        </li>
      )}
    </Link>
  );
};
