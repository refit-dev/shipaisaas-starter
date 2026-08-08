import { tool } from "ai";
// Import the library directly to bypass the index.js test runner that tries to
// open test/data/05-versions-space.pdf on module load (ENOENT in serverless).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse") as (
  buffer: Buffer,
) => Promise<{ text: string; numpages: number }>;
import { z } from "zod";

export const readDocumentTool = tool({
  description:
    "Fetch a PDF document from a URL and extract its full text content for analysis.",
  inputSchema: z.object({
    url: z
      .string()
      .describe("Public URL of the PDF document to read"),
  }),
  execute: async ({ url }) => {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return { error: "Invalid URL format" };
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return { error: "Only http/https URLs are supported" };
    }

    let response: Response;
    try {
      response = await fetch(url);
    } catch (err) {
      return { error: `Failed to fetch document: ${(err as Error).message}` };
    }

    if (!response.ok) {
      return {
        error: `Document fetch failed with HTTP ${response.status}`,
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (
      !contentType.includes("pdf") &&
      !contentType.includes("octet-stream")
    ) {
      return {
        error: `Expected a PDF but received content-type: ${contentType}`,
      };
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(await response.arrayBuffer());
    } catch {
      return { error: "Failed to read document body" };
    }

    try {
      const parsed = await pdfParse(buffer);
      return {
        text: parsed.text,
        pages: parsed.numpages,
      };
    } catch (err) {
      return { error: `Failed to parse PDF: ${(err as Error).message}` };
    }
  },
});
