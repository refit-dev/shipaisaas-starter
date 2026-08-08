import { UIDataTypes, UIMessagePart, UITools } from "ai";

/**
 * Safely maps Server-side CoreMessages into Client-side UIMessageParts
 * to satisfy the database schema's strict generic requirements.
 */
export function mapCoreToUIParts(
  content: any,
): Array<UIMessagePart<UIDataTypes, UITools>> {
  // 1. If the LLM just returned a standard string response
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }

  // 2. If the LLM returned a complex array of parts (Text + Tools)
  return content.map((part: any) => {
    if (part.type === "text") {
      return { type: "text", text: part.text };
    }

    // Map ToolCallPart to the UI's expected format
    if ((part.type as string).startsWith("tool-")) {
      return {
        // The SDK's UI types dynamically prefix the tool name
        type: part.type,
        toolCallId: part.toolCallId,
        state: "output-available", // Mark it as finished since the stream is done
        input: part.args,
        // We leave output undefined here; if you want to save tool results,
        // we extract that from the CoreToolMessage (explained below)
      } as unknown as UIMessagePart<UIDataTypes, UITools>;
    }

    // Fallback for edge cases
    return { type: "text", text: "" };
  });
}
