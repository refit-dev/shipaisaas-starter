import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const showcaseProjects = [
  {
    name: "TalentHive",
    url: "talenthive.ai",
    href: "https://talenthive.ai",
    image: "/_static/projects/talenthive.png",
    description:
      "Multi-agent recruiter swarm that autonomously sources, screens, and schedules candidate interviews.",
  },
  {
    name: "LedgerOS",
    url: "ledgeros.com",
    href: "https://ledgeros.com",
    image: "/_static/projects/ledgeros.png",
    description:
      "Automated bookkeeping swarm that reconciles transactions, flags anomalies, and generates financial reports.",
  },
  {
    name: "LegalSwarm",
    url: "legalswarm.ai",
    href: "https://legalswarm.ai",
    image: "/_static/projects/legalswarm.png",
    description:
      "Multi-agent system for automated contract review, redlining, and risk compliance analysis.",
  },
  {
    name: "ContentFlow",
    url: "contentflow.io",
    href: "https://contentflow.io",
    image: "/_static/projects/contentflow.png",
    description:
      "SEO optimization pipeline scaling full-funnel content generation via background research and writing agents.",
  },
  {
    name: "Resolve Desk",
    url: "resolvedesk.app",
    href: "https://resolvedesk.app",
    image: "/_static/projects/resolvedesk.png",
    description:
      "Autonomous customer success agents that research internal knowledge bases and resolve L1/L2 support tickets.",
  },
  {
    name: "OutreachAgents",
    url: "outreachagents.dev",
    href: "https://outreachagents.dev",
    image: "/_static/projects/outreachagents.png",
    description:
      "B2B sales swarm that researches prospects, drafts hyper-personalized outreach, and manages follow-ups.",
  },
  {
    name: "PropMind",
    url: "propmind.io",
    href: "https://propmind.io",
    image: "/_static/projects/propmind.png",
    description:
      "Property management AI that coordinates maintenance workflows, tenant communications, and lease renewals.",
  },
  {
    name: "CodeQA",
    url: "codeqa.dev",
    href: "https://codeqa.dev",
    image: "/_static/projects/codeqa.png",
    description:
      "Automated software testing swarm that writes, executes, and debugs end-to-end test suites in the background.",
  },
];

export default function Showcase() {
  return (
    <section className="py-24 sm:py-32">
      <MaxWidthWrapper>
        <div className="mb-12 sm:mb-16">
          <HeaderSection
            label="Showcase"
            title="Built with Ship AI SaaS Kit"
            subtitle="Explore how creators, developers, and founders are leveraging our boilerplate to ship production-ready vertical AI products in days."
          />
        </div>

        {/* Dense 4-column grid for smaller cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {showcaseProjects.map((project) => (
            <Link
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="group border-border/60 bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* PC Screen Aspect Ratio (16:9) Container */}
              <div className="border-border/50 bg-muted/20 relative aspect-video w-full overflow-hidden border-b">
                <Image
                  src={"/_static/projects/1.png"}
                  alt={`${project.name} landing page preview`}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105 dark:opacity-90"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Tighter Card Body */}
              <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                <div>
                  <h3 className="text-foreground text-base font-semibold tracking-tight">
                    {project.name}
                  </h3>
                  <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Link Footer */}
                <div className="text-primary group-hover:text-primary/80 mt-5 flex items-center gap-1.5 text-sm font-medium transition-colors">
                  <ExternalLink className="size-3.5" />
                  <span>{project.url}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
