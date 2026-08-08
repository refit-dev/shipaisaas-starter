import { UIDataTypes, UIMessagePart, UITools } from "ai";

/**
 * Safely maps server-side model message content into client-side UIMessageParts
 * to satisfy the database schema's strict generic requirements.
 */
export function mapCoreToUIParts(
  content: any,
): Array<UIMessagePart<UIDataTypes, UITools>> {
  // The model returned a plain string response
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }

  // The model returned an array of parts
  return content.map((part: any) =>
    part.type === "text"
      ? { type: "text", text: part.text }
      : { type: "text", text: "" },
  );
}
