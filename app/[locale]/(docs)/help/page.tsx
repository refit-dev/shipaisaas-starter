import Link from "next/link";
import { allHelp } from "contentlayer/generated";
import { compareDesc } from "date-fns";

import { formatDate } from "@/lib/utils";
import { DocsPageHeader } from "@/components/docs/page-header";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export const metadata = {
  title: "Help Center",
  description: "Guides and how-tos for getting the most out of the platform.",
};

export default function HelpPage() {
  const helps = (allHelp ?? [])
    .filter((help) => help.published)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return (
    <MaxWidthWrapper className="py-6 lg:py-10">
      <DocsPageHeader
        heading="Help Center"
        text="Guides and how-tos for getting the most out of the platform."
        root="Help"
      />
      {helps?.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-6">
          {helps.map((help) => (
            <article
              key={help._id}
              className="group relative rounded-lg border p-6 shadow-md transition-shadow hover:shadow-lg"
            >
              {help.featured && (
                <span className="bg-primary/10 text-primary absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-medium">
                  Start here
                </span>
              )}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-medium tracking-tight">
                    {help.title}
                  </h2>
                  {help.description && (
                    <p className="text-muted-foreground">{help.description}</p>
                  )}
                </div>
                {help.date && (
                  <p className="text-muted-foreground text-sm">
                    {formatDate(help.date)}
                  </p>
                )}
              </div>
              <Link href={help.slug} className="absolute inset-0">
                <span className="sr-only">View</span>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p>No guides published.</p>
      )}
    </MaxWidthWrapper>
  );
}
