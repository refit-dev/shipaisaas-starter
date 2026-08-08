import { notFound } from "next/navigation";
import { allPages } from "contentlayer/generated";

import { Mdx } from "@/components/content/mdx-components";

import "@/styles/mdx.css";

import { Metadata } from "next";

import { constructMetadata, getBlurDataURL } from "@/lib/utils";

async function getPageFromParams(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  return allPages.find((p) => p.slugAsParams === slug) ?? null;
}

export async function generateStaticParams() {
  return allPages.map((page) => ({ slug: page.slugAsParams }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const page = await getPageFromParams(params);
  if (!page) return;
  return constructMetadata({ title: page.title, description: page.description });
}

export default async function PagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const page = await getPageFromParams(params);

  if (!page) notFound();

  const images = await Promise.all(
    page.images.map(async (src: string) => ({
      src,
      blurDataURL: await getBlurDataURL(src),
    })),
  );

  return (
    <article className="container mx-auto max-w-3xl px-4 py-6 lg:px-16 lg:py-12">
      <div className="space-y-4">
        <h1 className="font-display inline-block text-4xl lg:text-5xl">
          {page.title}
        </h1>
        {page.description && (
          <p className="text-muted-foreground text-xl">{page.description}</p>
        )}
      </div>
      <hr className="my-4" />
      <Mdx code={page.body.code} images={images} />
    </article>
  );
}
