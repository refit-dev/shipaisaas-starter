// lib/ai/agents/registry.ts

export const AGENT_REGISTRY = {
  "content-creation": {
    id: "content-creation",
    name: "Content Strategist",
    description: "Expert at writing copy, SEO, and generating social assets.",
    icon: "PenTool", // Maps to Lucide icons in the UI
  },
  general: {
    id: "general",
    name: "General Assistant",
    description:
      "A helpful, all-purpose AI for answering questions and brainstorming.",
    icon: "Sparkles",
  },
  "reel-generator": {
    id: "reel-generator",
    name: "Reel Generator",
    description:
      "Creates complete short-form video content packages for Instagram Reels, TikTok, and YouTube Shorts.",
    icon: "Video",
  },
  "script-writer": {
    id: "script-writer",
    name: "Script Writer",
    description:
      "Writes long-form scripts for YouTube videos, podcasts, webinars, and ad copy.",
    icon: "FileText",
  },
  "thumbnail-creator": {
    id: "thumbnail-creator",
    name: "Thumbnail Creator",
    description:
      "Generates thumbnail design concepts and creates actual images with ChatGPT Image.",
    icon: "Image",
  },
  "receipt-scanner": {
    id: "receipt-scanner",
    name: "Receipt Scanner",
    description:
      "Scans receipt images and extracts structured line-item data including totals and payment info.",
    icon: "Receipt",
  },
  "legal-analyzer": {
    id: "legal-analyzer",
    name: "Legal Analyzer",
    description:
      "Analyzes legal documents (PDFs) for risks, obligations, key dates, and can email the analysis to a client.",
    icon: "Scale",
  },
} as const;

// Create a strict type so your API route knows exactly what IDs are valid
export type AgentId = keyof typeof AGENT_REGISTRY;
