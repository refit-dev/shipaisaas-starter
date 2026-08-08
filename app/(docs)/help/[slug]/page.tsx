import Link from "next/link";
import { notFound } from "next/navigation";
import { allHelp } from "contentlayer/generated";

import { getTableOfContents } from "@/lib/toc";
import { Mdx } from "@/components/content/mdx-components";
import { DocsPageHeader } from "@/components/docs/page-header";
import { Icons } from "@/components/shared/icons";
import { DashboardTableOfContents } from "@/components/shared/toc";

import "@/styles/mdx.css";

import { Metadata } from "next";

import { cn, constructMetadata } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export async function generateStaticParams() {
  return (allHelp ?? []).map((help) => ({
    slug: help.slugAsParams,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const help = allHelp.find((h) => h.slugAsParams === slug);
  if (!help) return;

  const { title, description } = help;
  return constructMetadata({ title, description });
}

export default async function HelpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const help = allHelp.find((h) => h.slugAsParams === slug);

  if (!help) notFound();

  const toc = await getTableOfContents(help.body.raw);

  return (
    <MaxWidthWrapper>
      <div className="relative py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 lg:py-10 xl:gap-20">
        <div>
          <DocsPageHeader heading={help.title} text={help.description} root="Help" />
          <Mdx code={help.body.code} />
          <hr className="my-4" />
          <div className="flex justify-center py-6 lg:py-10">
            <Link
              href="/help"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              <Icons.chevronLeft className="mr-2 size-4" />
              All guides
            </Link>
          </div>
        </div>
        <div className="hidden text-sm lg:block">
          <div className="sticky top-16 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-10">
            <DashboardTableOfContents toc={toc} />
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
