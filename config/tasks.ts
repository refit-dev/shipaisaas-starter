import { z } from "zod";

import { Icons } from "@/components/shared/icons";

export type TaskInput = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "image" | "file";
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
  outputType?: "text" | "image" | "json"; // defaults to text if undefined
  schema?: z.ZodType<any>; // 👈 Optional schema for structured JSON tasks
};

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    slug: "social-media-promo",
    title: "Social Media Promo",
    description:
      "Generate a highly engaging Instagram or LinkedIn post for a product.",
    icon: "megaphone",
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
    slug: "generate-image",
    title: "AI Image Generator",
    description:
      "Generate high-quality visual assets, blog covers, or social media graphics.",
    icon: "image", // Assuming you have an 'image' icon in your Icons component
    outputType: "image", // Flag this as an image task
    inputs: [
      {
        name: "subject",
        label: "Visual Subject",
        type: "textarea",
        placeholder:
          "e.g., A futuristic coffee shop on Mars with neon lights...",
      },
      {
        name: "style",
        label: "Art Style",
        type: "select",
        options: [
          "Photorealistic",
          "3D Render (Blender/Unreal Engine)",
          "Minimalist Vector Art",
          "Watercolor Illustration",
          "Cyberpunk / Sci-Fi",
        ],
      },
      {
        name: "aspectRatio",
        label: "Orientation",
        type: "select",
        options: ["Square (1:1)", "Landscape (16:9)", "Portrait (9:16)"],
      },
    ],
    // For images, we use this to prepend instructions to ChatGPT Image
    systemPrompt:
      "Generate a highly detailed, professional image based on the following parameters.",
  },
  // The Image Scanner (Use Case: Expense Management)
  {
    slug: "receipt-scanner",
    title: "Expense Receipt Scanner",
    description:
      "Upload a photo of a receipt to extract structured data for accounting.",
    icon: "receipt", // Assuming you have a receipt icon
    outputType: "json", // Tells the API to use generateObject
    inputs: [
      {
        name: "receiptImage",
        label: "Upload Receipt",
        type: "image",
      },
    ],
    systemPrompt: `You are an expert AI accountant. Scan the provided receipt image.
    Extract the merchant name, date, tax, total, and individual line items. 
    If a field is illegible or missing, return null. Extract prices strictly as numbers.`,
    schema: z.object({
      merchantName: z
        .string()
        .nullable()
        .describe("Name of the store or vendor"),
      date: z.string().nullable().describe("Date of purchase in YYYY-MM-DD"),
      taxAmount: z.number().nullable().describe("Total tax paid"),
      totalAmount: z.number().nullable().describe("Grand total of the receipt"),
      items: z.array(
        z.object({
          description: z.string().describe("Item name or description"),
          price: z.number().describe("Price of the individual item"),
        }),
      ),
    }),
  },

  // Document Analyzer (Use Case: Legal/Contract Summarizer)
  {
    slug: "contract-analyzer",
    title: "Legal Contract Analyzer",
    description:
      "Upload a document to extract key clauses, obligations, and potential risks.",
    icon: "file",
    outputType: "text", // Returns standard Markdown text
    inputs: [
      {
        name: "document",
        label: "Upload Contract (PDF/Doc) or Paste Text",
        type: "file",
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
    systemPrompt: `You are an elite corporate lawyer. Analyze the provided document.
    Format your response in clean Markdown. Use clear headings, bullet points, and bold text for emphasis.
    Focus your analysis strictly on the requested 'Analysis Focus' parameter.`,
  },
];
