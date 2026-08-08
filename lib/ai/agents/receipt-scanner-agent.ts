import { convertToModelMessages, ToolLoopAgent, UIMessage } from "ai";

import { resolveModel } from "@/lib/ai/models";
import { extractReceiptDataTool } from "@/lib/ai/tools/shared/extract-receipt-data";

import { saveAgentResponse } from "../utils";

export const maxDuration = 60;

export async function streamReceiptScannerAgent(
  messages: UIMessage[],
  team: any,
  conversationId: string,
  modelId?: string,
) {
  const tools = {
    extract_receipt_data: extractReceiptDataTool,
  };

  const receiptAgent = new ToolLoopAgent({
    model: resolveModel(modelId),
    tools,
    instructions: `
      You are a Receipt Scanner assistant. Your job is to extract structured data from receipt images.

      When the user's message contains "[Attached image: <url>]":
      1. Extract the URL from that marker.
      2. Immediately call 'extract_receipt_data' with that URL.
      3. Present the results in a clean, readable Markdown format with a table for line items and a summary row for totals.

      STRICT RULES:
      - NEVER describe what you see in the receipt yourself without calling 'extract_receipt_data' first.
      - NEVER make up receipt data.
      - If no image URL is present in the message, ask the user to attach a receipt image using the file upload button.

      FORMATTING RULES:
      - Present items in a Markdown table: | Item | Qty | Price |
      - Clearly show subtotal, tax, tip (if any), and total.
      - Show merchant name and date in a header if available.
    `,
    onStepFinish: async () => {},
    onFinish: async ({ response }) => {
      await saveAgentResponse(response, { conversationId, teamId: team.id });
    },
  });

  const modelMessages = await convertToModelMessages(messages);
  const result = await receiptAgent.stream({ prompt: modelMessages });
  return result;
}
