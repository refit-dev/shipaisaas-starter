import { CtaButton } from "@/components/shared/cta-button";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Highlight, Loop } from "@/components/shared/ornaments";

export default function BottomCta() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <MaxWidthWrapper>
        <div className="bg-card relative isolate overflow-hidden rounded-[2rem] border px-6 py-20 text-center sm:px-16">
          {/* Brand glow instead of a falling grid */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(70% 90% at 50% 0%, var(--hero-glow) 0%, transparent 65%)",
            }}
            aria-hidden
          />
          <Loop className="text-primary/20 pointer-events-none absolute -top-2 -right-6 hidden w-40 -scale-x-100 sm:block" />

          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
            <h2 className="font-display text-foreground text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-6xl">
              Ready to <Highlight>ship</Highlight> your AI SaaS?
            </h2>

            <p className="text-muted-foreground max-w-xl text-base leading-relaxed text-balance sm:text-lg">
              Clone the starter, add your keys, and have a working product with
              auth, billing and AI in an afternoon.
            </p>

            <CtaButton
              href="/signup"
              label="Start for $0"
              size="lg"
              className="mt-2"
            />
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
