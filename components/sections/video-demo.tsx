import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function VideoDemo() {
  // Replace with your actual YouTube video ID
  const videoId = "CrT0k2i_pco";

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center opacity-30 blur-3xl">
        <div className="bg-primary/20 aspect-[1/1] w-[40rem] rounded-full" />
      </div>

      <MaxWidthWrapper>
        <div className="mb-12 sm:mb-16">
          <HeaderSection
            label="Live Demo"
            title="Launch in minutes, not months."
            subtitle="Watch how easy it is to clone the boilerplate, configure your custom agents in the registry, and deploy a production-ready vertical SaaS."
          />
        </div>

        {/* Outer glowing frame */}
        <div className="bg-muted/20 ring-border/50 mx-auto max-w-5xl rounded-2xl p-2 ring-1 backdrop-blur-sm md:rounded-3xl md:p-4 lg:p-5">
          {/* Inner application window */}
          <div className="border-border/80 bg-background relative overflow-hidden rounded-xl border shadow-2xl">
            {/* YouTube Embed Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="absolute inset-0 size-full"
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title="Ship AI SaaS Boilerplate Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
