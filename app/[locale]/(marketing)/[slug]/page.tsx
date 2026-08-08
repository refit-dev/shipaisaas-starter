import { notFound } from "next/navigation";
import { allPages } from "contentlayer/generated";

import { Mdx } from "@/components/content/mdx-components";

import "@/styles/mdx.css";

import { Metadata } from "next";

import { constructMetadata, getBlurDataURL } from "@/lib/utils";

async function getPageFromParams(params: Promise<{ locale: string; slug: string }>) {
  const { locale, slug } = await params;

  // 1. Try to find an exact locale match (e.g. terms.fr.mdx for locale=fr, slug=terms)
  const localized = allPages.find(
    (p) => (p as any).slugBase === slug && (p as any).locale === locale,
  );
  if (localized) return localized;

  // 2. Fall back to the English version (terms.mdx)
  const fallback = allPages.find(
    (p) => (p as any).slugBase === slug && (p as any).locale === "en",
  );
  return fallback ?? null;
}

export async function generateStaticParams() {
  // Return unique base slugs; [locale] is already covered by the parent layout's generateStaticParams
  const seen = new Set<string>();
  return allPages
    .map((p) => (p as any).slugBase ?? p.slugAsParams)
    .filter((slug: string) => {
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map((slug: string) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata | undefined> {
  const page = await getPageFromParams(params);
  if (!page) return;
  return constructMetadata({ title: page.title, description: page.description });
}

export default async function PagePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
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
        <h1 className="font-heading inline-block text-4xl lg:text-5xl">
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
