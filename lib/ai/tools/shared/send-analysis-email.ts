import { tool } from "ai";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "noreply@yourdomain.com";

function buildAnalysisMarkdown(value: any): string {
  const lines: string[] = [];
  if (value.summary) lines.push(`## Summary\n\n${value.summary}\n`);
  if (value.documentType) lines.push(`**Type:** ${value.documentType}`);
  if (value.effectiveDate) lines.push(`**Effective:** ${value.effectiveDate}`);
  if (value.expirationDate) lines.push(`**Expires:** ${value.expirationDate}`);
  if (value.governingLaw) lines.push(`**Governing Law:** ${value.governingLaw}`);

  if (value.keyParties?.length > 0) {
    lines.push("\n## Key Parties\n");
    for (const p of value.keyParties) lines.push(`- ${p}`);
  }

  if (value.keyObligations?.length > 0) {
    lines.push("\n## Key Obligations\n");
    for (const o of value.keyObligations) {
      lines.push(`- **${o.party}**: ${o.obligation}`);
    }
  }

  if (value.risks?.length > 0) {
    lines.push("\n## Risks\n");
    const badge = (level: string) =>
      level === "high" ? "🔴" : level === "medium" ? "🟡" : "🟢";
    for (const r of value.risks) {
      lines.push(`${badge(r.level)} **${r.level.toUpperCase()}**: ${r.description}`);
    }
  }

  if (value.keyDates?.length > 0) {
    lines.push("\n## Key Dates\n");
    for (const d of value.keyDates) {
      lines.push(`- **${d.event}**: ${d.date}`);
    }
  }

  if (value.recommendations?.length > 0) {
    lines.push("\n## Recommendations\n");
    for (const rec of value.recommendations) lines.push(`- ${rec}`);
  }

  return lines.join("\n").trim();
}

function markdownToHtml(markdown: string): string {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 700px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
<pre style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px;">${escaped}</pre>
</body>
</html>`;
}

export const sendAnalysisEmailTool = tool({
  description:
    "Send a legal document analysis to a client via email. Pass the complete output object from analyze_legal_document as analysisData. Requires user approval before sending.",
  inputSchema: z.object({
    recipientEmail: z
      .string()
      .describe("The client's email address"),
    recipientName: z
      .string()
      .nullable()
      .describe("The client's name for personalization, or null"),
    subject: z
      .string()
      .describe("Email subject line"),
    analysisData: z
      .record(z.string(), z.any())
      .describe("The complete output object from analyze_legal_document tool call"),
  }),
  needsApproval: true,
  execute: async ({ recipientEmail, recipientName, subject, analysisData }) => {
    const markdown = buildAnalysisMarkdown(analysisData);
    const greeting = recipientName
      ? `<p>Hi ${recipientName},</p>`
      : `<p>Hello,</p>`;

    const html =
      greeting +
      `<p>Please find the legal document analysis below.</p>` +
      markdownToHtml(markdown);

    try {
      const result = await resend.emails.send({
        from: FROM,
        to: recipientEmail,
        subject,
        html,
      });

      if (result.error) {
        return { error: `Email send failed: ${result.error.message}` };
      }

      return { success: true, messageId: result.data?.id ?? "sent" };
    } catch (error) {
      console.error("[Tool] Email send error:", error);
      return { error: `Failed to send email: ${(error as Error).message}` };
    }
  },
});
