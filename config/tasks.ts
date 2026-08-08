import { z } from "zod";

import { Icons } from "@/components/shared/icons";

export type TaskInput = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[]; // For select fields
};

export type TaskTemplate = {
  slug: string;
  title: string;
  description: string;
  icon: keyof typeof Icons;
  inputs: TaskInput[];
  systemPrompt: string;
  /** "text" streams Markdown back, "json" enforces the `schema` below. */
  outputType?: "text" | "json";
  schema?: z.ZodType<any>; // Required when outputType is "json"
};

/**
 * Add your own templates here — each one becomes a page under /dashboard/tasks.
 * A template needs nothing but a slug, some inputs, and a system prompt.
 */
export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    slug: "social-media-promo",
    title: "Social Media Promo",
    description:
      "Generate a highly engaging Instagram or LinkedIn post for a product.",
    icon: "megaphone",
    outputType: "text",
    inputs: [
      {
        name: "product",
        label: "Product Name",
        type: "text",
        placeholder: "e.g., Almond Croissant",
      },
      {
        name: "highlight",
        label: "Key Highlight or Feature",
        type: "textarea",
        placeholder:
          "e.g., Made with imported French butter and baked fresh every morning.",
      },
      {
        name: "tone",
        label: "Brand Tone",
        type: "select",
        options: [
          "Professional",
          "Warm & Artisanal",
          "Funny & Irreverent",
          "Urgent/Salesy",
        ],
      },
    ],
    systemPrompt: `You are an elite social media copywriter.
Write a highly engaging post promoting the user's product.
Strictly adhere to the requested Brand Tone.
Keep sentences punchy and avoid cringe corporate jargon.
Include exactly 3 highly relevant hashtags.
Never output raw HTML, use Markdown formatting.`,
  },
  {
    slug: "cold-email",
    title: "Cold Email Outreach",
    description: "Draft a high-converting cold email to a potential client.",
    icon: "mail",
    outputType: "text",
    inputs: [
      {
        name: "target",
        label: "Target Audience",
        type: "text",
        placeholder: "e.g., Local Gym Owners",
      },
      {
        name: "valueProp",
        label: "Our Value Proposition",
        type: "textarea",
        placeholder: "e.g., We automate lead follow-ups using AI.",
      },
    ],
    systemPrompt: `You are a top-1% B2B sales development rep.
Write a concise, 4-sentence cold email.
Focus on the prospect's pain points. End with a low-friction call to action.`,
  },
  {
    slug: "document-summary",
    title: "Document Summarizer",
    description:
      "Paste a contract, report, or long email and get a structured summary.",
    icon: "file",
    outputType: "text",
    inputs: [
      {
        name: "document",
        label: "Document Text",
        type: "textarea",
        placeholder: "Paste the document content here...",
      },
      {
        name: "focus",
        label: "Analysis Focus",
        type: "select",
        options: [
          "General Summary",
          "Identify Risks & Liabilities",
          "Extract Key Dates & Deliverables",
        ],
      },
    ],
    systemPrompt: `You are an expert analyst. Analyze the provided document.
Format your response in clean Markdown. Use clear headings, bullet points, and bold text for emphasis.
Focus your analysis strictly on the requested 'Analysis Focus' parameter.`,
  },
  {
    // Structured output example: the model must return JSON matching `schema`.
    slug: "meeting-notes",
    title: "Meeting Notes Extractor",
    description:
      "Turn messy meeting notes into structured decisions and action items.",
    icon: "task",
    outputType: "json",
    inputs: [
      {
        name: "notes",
        label: "Raw Meeting Notes",
        type: "textarea",
        placeholder: "Paste your rough notes or a transcript here...",
      },
    ],
    systemPrompt: `You are a meticulous chief of staff. Read the raw meeting notes
and extract the structured outcome. Only include action items that were actually
agreed on. If an owner or due date was never mentioned, return null for it.`,
    schema: z.object({
      title: z.string().describe("A short title for the meeting"),
      summary: z.string().describe("A two-sentence summary of the discussion"),
      decisions: z
        .array(z.string())
        .describe("Concrete decisions that were made"),
      actionItems: z.array(
        z.object({
          task: z.string().describe("What needs to be done"),
          owner: z.string().nullable().describe("Who owns it, or null"),
          dueDate: z
            .string()
            .nullable()
            .describe("Due date as YYYY-MM-DD, or null"),
        }),
      ),
    }),
  },
];
