import { openai } from "@ai-sdk/openai";
import { generateText, Output, tool } from "ai";
import { z } from "zod";

export const analyzeLegalDocumentTool = tool({
  description:
    "Analyze extracted legal document text and produce a structured analysis including summary, parties, obligations, risks, and key dates.",
  inputSchema: z.object({
    documentText: z
      .string()
      .describe("The full extracted text of the legal document"),
    documentType: z
      .string()
      .nullable()
      .describe(
        "Document type hint (e.g. NDA, Lease, Employment Agreement). Pass null if unknown.",
      ),
  }),
  execute: async ({ documentText, documentType }) => {
    try {
      const result = await generateText({
        model: openai("gpt-4o"),
        system: `You are a senior legal analyst. Analyze the provided legal document thoroughly and extract all key information in structured form.
Be precise about parties, dates, obligations, and risks. Classify each risk as low, medium, or high.
${documentType ? `The document type is: ${documentType}.` : ""}`,
        prompt: `DOCUMENT TEXT:\n\n${documentText.slice(0, 80000)}`,
        output: Output.object({
          schema: z.object({
            summary: z
              .string()
              .describe(
                "2-3 sentence plain-language summary of the document",
              ),
            documentType: z
              .string()
              .describe(
                "Identified document type (e.g. NDA, Lease, Service Agreement)",
              ),
            keyParties: z
              .array(z.string())
              .describe("All named parties in the document"),
            effectiveDate: z
              .string()
              .nullable()
              .describe("Effective date of the agreement"),
            expirationDate: z
              .string()
              .nullable()
              .describe("Expiration or termination date, if any"),
            keyObligations: z.array(
              z.object({
                party: z.string().describe("The party bearing this obligation"),
                obligation: z
                  .string()
                  .describe("Description of the obligation"),
              }),
            ),
            risks: z.array(
              z.object({
                level: z.enum(["low", "medium", "high"]),
                description: z.string().describe("Description of the risk"),
              }),
            ),
            keyDates: z.array(
              z.object({
                event: z.string().describe("What happens on this date"),
                date: z.string().describe("The date or deadline"),
              }),
            ),
            governingLaw: z
              .string()
              .nullable()
              .describe("Governing law jurisdiction"),
            recommendations: z
              .array(z.string())
              .describe("Actionable recommendations for the reader"),
          }),
        }),
      });

      return result.output;
    } catch (error) {
      console.error("[Tool] Legal analysis error:", error);
      return {
        error: `Failed to analyze document: ${(error as Error).message}`,
      };
    }
  },
});
