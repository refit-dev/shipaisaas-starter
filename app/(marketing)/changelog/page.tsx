import { Check } from "lucide-react";

import { changelog, ChangelogTag } from "@/config/changelog";
import { constructMetadata } from "@/lib/utils";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Highlight } from "@/components/shared/ornaments";

export const metadata = constructMetadata({
  title: "Changelog",
  description: "New features, improvements and fixes.",
});

const TAG_CLASSES: Record<ChangelogTag, string> = {
  Feature: "bg-primary/10 text-primary",
  Improvement: "bg-secondary text-secondary-foreground",
  Design: "bg-accent text-accent-foreground",
  Fix: "bg-destructive/10 text-destructive",
};

export default function ChangelogPage() {
  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="bg-muted border-border border-b">
        <MaxWidthWrapper className="py-16 md:py-20">
          <p className="text-primary mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">
            Changelog
          </p>
          <h1 className="text-foreground font-display text-3xl font-bold tracking-[-0.02em] text-balance md:text-4xl lg:text-5xl">
            What&apos;s <Highlight>new</Highlight>.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg text-sm leading-relaxed md:text-base">
            New features, improvements and fixes.
          </p>
        </MaxWidthWrapper>
      </div>

      {/* Entries */}
      <div className="bg-background">
        <MaxWidthWrapper className="py-16 md:py-20">
          <div className="flex flex-col">
            {changelog.map((entry) => (
              <div
                key={`${entry.date}-${entry.title}`}
                className="border-border grid grid-cols-1 gap-8 border-t py-12 md:grid-cols-4 md:gap-12"
              >
                {/* Left: date + tag */}
                <div className="md:col-span-1">
                  <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                    {entry.date}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${TAG_CLASSES[entry.tag]}`}
                  >
                    {entry.tag}
                  </span>
                </div>

                {/* Right: content */}
                <div className="md:col-span-3">
                  <h2 className="text-foreground mb-3 text-xl font-semibold tracking-tight">
                    {entry.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    {entry.description}
                  </p>
                  <ul className="border-border space-y-2.5 border-t pt-5">
                    {entry.changes.map((change) => (
                      <li key={change} className="flex items-start gap-3 text-sm">
                        <Check
                          className="text-primary mt-0.5 size-3.5 shrink-0"
                          strokeWidth={2.5}
                        />
                        <span className="text-foreground/75 leading-snug">
                          {change}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            {/* End marker */}
            <div className="border-border border-t pt-10 text-center">
              <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
                You&apos;re up to date
              </p>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </div>
  );
}
