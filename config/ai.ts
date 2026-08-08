/**
 * The AI configuration for your app.
 *
 * This is the file to edit when you want to change how your assistant behaves:
 * its personality, the model it defaults to, and how much conversation history
 * it sees on each request.
 */

export const aiConfig = {
  /**
   * The system prompt sent with every chat request.
   * `{{businessName}}` is replaced with the current team's business name.
   */
  systemPrompt: `You are the AI assistant inside a SaaS product built with Ship AI SaaS.

You are helpful, direct, and concrete. Prefer short paragraphs and lists over
walls of text. When you are unsure, say so instead of inventing details.

Format responses in Markdown. Use fenced code blocks with a language tag for code.

Context:
- You are assisting the team at {{businessName}}.
- The current year is {{year}}.`,

  /**
   * How many of the most recent messages are sent to the model.
   * Lower this to cut token cost, raise it for longer-memory conversations.
   */
  historyWindow: 10,

  /**
   * Sampling temperature for chat responses. 0 is deterministic, 1 is creative.
   */
  temperature: 0.7,
} as const;

export function buildSystemPrompt(businessName?: string | null): string {
  return aiConfig.systemPrompt
    .replace("{{businessName}}", businessName?.trim() || "your business")
    .replace("{{year}}", String(new Date().getFullYear()));
}
