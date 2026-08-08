import Image from "next/image";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function PreviewLanding() {
  return (
    <div className="pb-16 sm:pb-24">
      <MaxWidthWrapper>
        {/* Neutral bloom above the preview */}
        <div className="relative">
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 w-3/4 h-32 z-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.04) 45%, transparent 72%)",
              filter: "blur(28px)",
            }}
            aria-hidden
          />
          {/* Outer dashed frame */}
          <div className="relative z-10 border border-dashed border-border rounded-2xl p-2 bg-muted/10 backdrop-blur-sm md:rounded-3xl">
            {/* Inner application window */}
            <div className="bg-background relative overflow-hidden rounded-xl border border-dashed border-border shadow-[0_32px_80px_-12px_rgba(0,0,0,0.15)]">
              <Image
                className="w-full object-cover object-top dark:opacity-90"
                src="/_static/ui-ss/dashboard.png"
                alt="Dashboard preview"
                width={1349}
                height={632}
                priority={true}
              />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
