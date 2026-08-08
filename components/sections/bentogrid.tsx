import {
  CheckCircle2,
  Cpu,
  Database,
  MessageSquare,
  Network,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function BentoGrid() {
  return (
    <section className="py-24 sm:py-32">
      <MaxWidthWrapper>
        <div className="relative z-10 grid grid-cols-6 gap-4 sm:gap-6">
          {/* First card - Top Left */}
          <div className="border-border/60 bg-card col-span-full flex flex-col overflow-hidden rounded-3xl border p-8 shadow-sm lg:col-span-2">
            <div className="border-border/50 bg-muted/30 mb-6 flex size-12 items-center justify-center rounded-2xl border">
              <Network className="text-foreground size-6" />
            </div>
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              Intelligent Routing
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Dynamically route user inputs and sub-tasks to the specialized
              agent best equipped to handle them.
            </p>
          </div>

          {/* Second card - Top Middle */}
          <div className="border-border/60 bg-card col-span-full flex flex-col overflow-hidden rounded-3xl border p-8 shadow-sm sm:col-span-3 lg:col-span-2">
            <div className="border-border/50 bg-muted/30 mb-6 flex size-12 items-center justify-center rounded-2xl border">
              <Cpu className="text-foreground size-6" />
            </div>
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              Autonomous Execution
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Agents work in parallel, breaking down complex instructions into
              actionable, multi-step workflows.
            </p>
          </div>

          {/* Third card - Top Right */}
          <div className="border-border/60 bg-card col-span-full flex flex-col overflow-hidden rounded-3xl border p-8 shadow-sm sm:col-span-3 lg:col-span-2">
            <div className="border-border/50 bg-muted/30 mb-6 flex size-12 items-center justify-center rounded-2xl border">
              <ShieldCheck className="text-foreground size-6" />
            </div>
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              Isolated Contexts
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Keep your data secure. Agents operate in sandboxed environments
              with strict permission controls.
            </p>
          </div>

          {/* Fourth card - Bottom Left (Large) */}
          <div className="border-border/60 bg-card col-span-full flex flex-col overflow-hidden rounded-3xl border shadow-sm lg:col-span-3">
            <div className="flex flex-1 flex-col sm:flex-row">
              <div className="flex flex-col justify-center p-8 sm:w-1/2">
                <div className="border-border/50 bg-muted/30 mb-6 flex size-12 items-center justify-center rounded-2xl border">
                  <Users className="text-foreground size-6" />
                </div>
                <h2 className="text-foreground text-xl font-semibold tracking-tight">
                  Multi-Agent Collaboration
                </h2>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  Watch your swarm collaborate. Agents share context, memories,
                  and tool outputs to deliver compounded, highly-accurate
                  results.
                </p>
              </div>

              {/* CSS-based Graphic instead of SVG */}
              <div className="border-border/50 bg-muted/20 relative flex min-h-[250px] flex-1 items-center justify-center border-t p-8 sm:border-t-0 sm:border-l">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                <div className="relative flex w-full max-w-[220px] flex-col gap-4">
                  {/* Agent Node 1 */}
                  <div className="border-border/60 bg-background z-10 flex items-center gap-3 rounded-xl border p-3 shadow-sm">
                    <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                      <MessageSquare className="text-primary size-4" />
                    </div>
                    <span className="text-sm font-medium">Router Agent</span>
                  </div>
                  {/* Connecting Line */}
                  <div className="bg-border/80 absolute top-[40px] left-[27px] h-[calc(100%-80px)] w-px" />
                  {/* Agent Node 2 */}
                  <div className="border-border/60 bg-background z-10 ml-8 flex items-center gap-3 rounded-xl border p-3 shadow-sm">
                    <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                      <Database className="text-primary size-4" />
                    </div>
                    <span className="text-sm font-medium">Research Agent</span>
                  </div>
                  {/* Agent Node 3 */}
                  <div className="border-border/60 bg-background z-10 ml-8 flex items-center gap-3 rounded-xl border p-3 shadow-sm">
                    <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                      <CheckCircle2 className="text-primary size-4" />
                    </div>
                    <span className="text-sm font-medium">Writer Agent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fifth card - Bottom Right (Large) */}
          <div className="border-border/60 bg-card col-span-full flex flex-col overflow-hidden rounded-3xl border shadow-sm lg:col-span-3">
            <div className="flex flex-1 flex-col-reverse sm:flex-row">
              {/* CSS-based Graphic instead of SVG */}
              <div className="border-border/50 bg-muted/20 relative flex min-h-[250px] flex-1 items-center justify-center border-t p-8 sm:border-t-0 sm:border-r">
                <div className="w-full max-w-[240px] space-y-4">
                  {/* Mock Toggle 1 */}
                  <div className="border-border/60 bg-background flex items-center justify-between rounded-xl border p-4 shadow-sm">
                    <span className="text-sm font-semibold tracking-tight">
                      Stripe Billing
                    </span>
                    <div className="bg-primary/90 relative h-5 w-9 rounded-full">
                      <div className="bg-background absolute top-0.5 right-0.5 size-4 rounded-full shadow-sm" />
                    </div>
                  </div>
                  {/* Mock Toggle 2 */}
                  <div className="border-border/60 bg-background flex items-center justify-between rounded-xl border p-4 shadow-sm">
                    <span className="text-sm font-semibold tracking-tight">
                      NextAuth.js
                    </span>
                    <div className="bg-primary/90 relative h-5 w-9 rounded-full">
                      <div className="bg-background absolute top-0.5 right-0.5 size-4 rounded-full shadow-sm" />
                    </div>
                  </div>
                  {/* Mock Toggle 3 */}
                  <div className="border-border/60 bg-background flex items-center justify-between rounded-xl border p-4 shadow-sm">
                    <span className="text-sm font-semibold tracking-tight">
                      User Dashboard
                    </span>
                    <div className="bg-primary/90 relative h-5 w-9 rounded-full">
                      <div className="bg-background absolute top-0.5 right-0.5 size-4 rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center p-8 sm:w-1/2">
                <div className="border-border/50 bg-muted/30 mb-6 flex size-12 items-center justify-center rounded-2xl border">
                  <Rocket className="text-foreground size-6" />
                </div>
                <h2 className="text-foreground text-xl font-semibold tracking-tight">
                  Production Ready SaaS
                </h2>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  Focus purely on your agent logic. We handle the heavy lifting
                  with built-in authentication, subscriptions, and a beautiful
                  UI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
