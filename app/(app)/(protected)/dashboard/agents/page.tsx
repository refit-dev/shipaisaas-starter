"use client";

import { Agent, useAssistantStore } from "@/stores/assistantStore";
import {
  ArrowRight,
  Bot,
  FileText,
  Image,
  PenTool,
  Receipt,
  Scale,
  Sparkles,
  Terminal,
  Video,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/react/shallow";

import { AGENT_REGISTRY } from "@/lib/ai/agents/registry";

// Map the string icon names from your registry to actual Lucide components
const iconMap: Record<string, React.ElementType> = {
  Sparkles: Sparkles,
  PenTool: PenTool,
  Terminal: Terminal,
  Video: Video,
  FileText: FileText,
  Image: Image,
  Receipt: Receipt,
  Scale: Scale,
};

export default function AgentsPage() {
  const t = useTranslations("dashboard.agents");
  // Grab the necessary actions from your Zustand store
  const { setSelectedAgent, setIsOpen, setMode } = useAssistantStore(
    useShallow((state) => ({
      setSelectedAgent: state.setSelectedAgent,
      setIsOpen: state.setIsOpen,
      setMode: state.setMode,
    })),
  );

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setMode("sidebar"); // Force the assistant into sidebar mode
    setIsOpen(true); // Slide it open
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(AGENT_REGISTRY).map((agent) => {
          const Icon = iconMap[agent.icon] || Bot;

          return (
            <div
              key={agent.id}
              onClick={() => handleSelectAgent(agent)}
              className="group bg-card text-card-foreground hover:border-primary relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
            >
              {/* Card Content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="bg-primary flex size-10 items-center justify-center rounded-lg">
                    <Icon className="text-primary-foreground size-5" />
                  </div>
                  {/* Subtle indicator that it's clickable */}
                  <div className="bg-muted flex size-8 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowRight className="text-muted-foreground size-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="leading-none font-semibold tracking-tight">
                    {agent.name}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {agent.description}
                  </p>
                </div>
              </div>

              {/* Hover Gradient Effect (Optional premium touch) */}
              <div className="from-accent/5 absolute inset-0 -z-10 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
