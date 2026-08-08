import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const STARS = Array.from({ length: 5 });

export default function VideoTestimonial() {
  return (
    <section className="bg-background py-24 sm:py-32">
      <MaxWidthWrapper>
        <div className="border-border/60 bg-muted/50 overflow-hidden rounded-3xl border">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Video thumbnail */}
            <div className="bg-muted relative flex min-h-[280px] items-center justify-center md:min-h-[400px]">
              <button
                type="button"
                aria-label="Play customer story video"
                className="bg-background/90 border-border hover:bg-background flex h-16 w-16 items-center justify-center rounded-full border shadow-lg transition-all hover:scale-105"
              >
                <svg
                  className="text-foreground ml-1 h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <div className="text-muted-foreground/40 absolute bottom-4 left-4 text-xs font-medium">
                Customer Story · 3 min
              </div>
            </div>

            {/* Quote side */}
            <div className="flex flex-col justify-center p-10 lg:p-14">
              <div className="mb-5 flex gap-1">
                {STARS.map((_, i) => (
                  <svg
                    key={i}
                    className="text-foreground h-4 w-4 fill-current"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-foreground mb-6 text-2xl font-semibold tracking-tight text-balance leading-snug sm:text-3xl">
                &quot;This replaced three full-time hires.&quot;
              </blockquote>

              <div>
                <p className="text-foreground text-sm font-semibold">
                  Sarah Chen
                </p>
                <p className="text-muted-foreground text-sm">
                  Head of Operations · Meridian Group
                </p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
