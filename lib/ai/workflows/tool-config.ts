export const WORKFLOW_TOOL_CONFIG = [
  { name: "web_search",       label: "Web Search",        emoji: "🔍" },
  { name: "web_extract",      label: "Web Extract",       emoji: "🌐" },
  { name: "generate_outline", label: "Generate Outline",  emoji: "📝" },
  { name: "generate_report",  label: "Generate Report",   emoji: "📊" },
  { name: "format_post",      label: "Format Post",       emoji: "✍️" },
  { name: "generate_image",   label: "Generate Image",    emoji: "🖼️" },
  { name: "memory",           label: "Memory",            emoji: "🧠" },
  { name: "llm_response",     label: "AI Response",       emoji: "💬" },
] as const;

export type WorkflowToolName = typeof WORKFLOW_TOOL_CONFIG[number]["name"];

// Tuple cast required by z.enum — must be [T, ...T[]] not T[]
export const WORKFLOW_TOOL_NAMES = WORKFLOW_TOOL_CONFIG.map(
  (t) => t.name,
) as unknown as [WorkflowToolName, ...WorkflowToolName[]];
