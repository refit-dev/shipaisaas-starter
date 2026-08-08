import { openai } from "@ai-sdk/openai";
import { generateText, Output, tool } from "ai";
import { z } from "zod";

export const extractReceiptDataTool = tool({
  description:
    "Extract structured line-item data from a receipt image URL using GPT-4o vision.",
  inputSchema: z.object({
    imageUrl: z
      .string()
      .describe("Public URL of the receipt image to analyze"),
  }),
  execute: async ({ imageUrl }) => {
    try {
      const result = await generateText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all structured data from this receipt image. Be precise with item names, quantities, and prices.",
              },
              {
                type: "image",
                image: new URL(imageUrl),
              },
            ],
          },
        ],
        output: Output.object({
          schema: z.object({
            merchant: z.string().nullable().describe("Merchant or store name"),
            date: z
              .string()
              .nullable()
              .describe("Transaction date (ISO 8601 if possible)"),
            items: z.array(
              z.object({
                name: z.string().describe("Item name or description"),
                quantity: z
                  .number()
                  .nullable()
                  .describe("Quantity purchased"),
                unitPrice: z
                  .number()
                  .nullable()
                  .describe("Price per unit"),
                totalPrice: z
                  .number()
                  .nullable()
                  .describe("Total price for this line item"),
              }),
            ),
            subtotal: z
              .number()
              .nullable()
              .describe("Subtotal before tax and tip"),
            tax: z.number().nullable().describe("Tax amount"),
            tip: z.number().nullable().describe("Tip amount if present"),
            total: z.number().nullable().describe("Grand total"),
            currency: z
              .string()
              .nullable()
              .describe("Currency code (e.g. USD)"),
            paymentMethod: z
              .string()
              .nullable()
              .describe("Payment method (e.g. Visa, Cash)"),
            receiptNumber: z
              .string()
              .nullable()
              .describe("Receipt or transaction number"),
          }),
        }),
      });

      return result.output;
    } catch (error) {
      console.error("[Tool] Receipt extraction error:", error);
      return {
        error: `Failed to extract receipt data: ${(error as Error).message}`,
      };
    }
  },
});
