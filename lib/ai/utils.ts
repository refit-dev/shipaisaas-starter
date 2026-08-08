import {
  generateId,
  ToolApprovalRequest,
  ToolContent,
  ToolResultPart,
} from "ai";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema/agent";
import { messages as messagesTable } from "@/lib/db/schema/chat";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AssetContext {
  teamId: string;
  conversationId: string;
  runId?: number;
}

interface NormalizedToolResult {
  toolCallId: string;
  toolName: string;
  input: Record<string, any>;
  output: unknown;
}

// ---------------------------------------------------------------------------
// 1. normalizeToolResults
//
// Single source of truth for extracting tool results from an SDK response.
// Handles both normal results (tool role messages) and approval-gated results
// (tool-approval-request parts) in one pass — eliminating the duplication
// that caused the asset registry to appear twice.
// ---------------------------------------------------------------------------

function normalizeToolResults(messages: any[]): NormalizedToolResult[] {
  const results: NormalizedToolResult[] = [];

  for (const msg of messages) {
    if (msg.role !== "assistant") continue;

    const content = Array.isArray(msg.content) ? msg.content : [];

    for (const part of content) {
      if (part.type !== "tool-call") continue;

      // Find the matching result in tool role messages
      const toolMsg = messages.find(
        (m) =>
          m.role === "tool" &&
          Array.isArray(m.content) &&
          m.content.some(
            (c: any) =>
              c.type === "tool-result" && c.toolCallId === part.toolCallId,
          ),
      );

      if (!toolMsg) continue;

      const resultPart = toolMsg.content.find(
        (c: any) =>
          c.type === "tool-result" && c.toolCallId === part.toolCallId,
      ) as ToolResultPart | undefined;

      if (!resultPart) continue;

      results.push({
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        input: part.input ?? {},
        output: resultPart.output,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// 2. buildMessageParts
//
// Converts raw SDK response messages into the UI parts shape your frontend
// expects. Returns both the parts array and whether approval is pending.
// ---------------------------------------------------------------------------

function buildMessageParts(messages: any[]): {
  parts: any[];
  toolNeedsApproval: boolean;
} {
  let parts: any[] = [];
  let toolNeedsApproval = false;

  for (const msg of messages) {
    if (msg.role !== "assistant") continue;

    const content = Array.isArray(msg.content) ? msg.content : [];

    const uiParts = content.flatMap((part: any) => {
      if (part.type === "text") {
        return [{ type: "text", text: part.text }];
      }

      if (part.type === "tool-call") {
        const approvalRequest = content.find(
          (c: any) =>
            c.type === "tool-approval-request" &&
            c.toolCallId === part.toolCallId,
        ) as ToolApprovalRequest | undefined;

        if (approvalRequest) {
          toolNeedsApproval = true;
          return [
            {
              type: `tool-${part.toolName}`,
              toolCallId: part.toolCallId,
              state: "approval-requested",
              input: part.input,
              approval: { id: approvalRequest.approvalId },
              output: undefined,
            },
          ];
        }

        // Find result in tool messages
        const toolMsg = messages.find(
          (m) =>
            m.role === "tool" &&
            Array.isArray(m.content) &&
            m.content.some(
              (c: any) =>
                c.type === "tool-result" && c.toolCallId === part.toolCallId,
            ),
        );

        let toolResultData = undefined;
        let toolState = "input-available";

        if (toolMsg) {
          const resultPart = toolMsg.content.find(
            (c: any) =>
              c.type === "tool-result" && c.toolCallId === part.toolCallId,
          ) as ToolResultPart | undefined;

          if (resultPart) {
            toolResultData = resultPart.output;
            toolState = "output-available";
          }
        }

        return [
          {
            type: `tool-${part.toolName}`,
            toolCallId: part.toolCallId,
            state: toolState,
            input: part.input,
            output: toolResultData,
          },
        ];
      }

      // Skip raw approval-request parts — already handled inside tool-call branch
      if (part.type === "tool-approval-request") return [];

      return [part];
    });

    parts = [...parts, ...uiParts];
  }

  return { parts, toolNeedsApproval };
}

// ---------------------------------------------------------------------------
// outlineToMarkdown
//
// Converts a structured outline object into markdown format for better readability and copying.
// ---------------------------------------------------------------------------

function outlineToMarkdown(outline: {
  title?: string;
  sections?: { heading: string; points: string[] }[];
}): string {
  const lines: string[] = [];

  if (outline.title) {
    lines.push(`# ${outline.title}`, "");
  }

  for (const section of outline.sections ?? []) {
    lines.push(`## ${section.heading}`, "");
    for (const point of section.points ?? []) {
      lines.push(`- ${point}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

// ---------------------------------------------------------------------------
// scriptToMarkdown
//
// Converts a structured script object into readable markdown.
// ---------------------------------------------------------------------------

function scriptToMarkdown(script: {
  title?: string;
  acts?: {
    actTitle: string;
    sections: { timestamp: string; cue?: string; narration: string }[];
  }[];
  estimatedRuntime?: string;
}): string {
  const lines: string[] = [];

  if (script.title) {
    lines.push(`# ${script.title}`, "");
  }

  if (script.estimatedRuntime) {
    lines.push(`*Estimated runtime: ${script.estimatedRuntime}*`, "");
  }

  for (const act of script.acts ?? []) {
    lines.push(`## ${act.actTitle}`, "");
    for (const section of act.sections ?? []) {
      lines.push(`**[${section.timestamp}]**${section.cue ? ` *${section.cue}*` : ""}`);
      lines.push(section.narration, "");
    }
  }

  return lines.join("\n").trim();
}

// ---------------------------------------------------------------------------
// 3. ASSET_REGISTRY
//
// Maps tool names to asset builders. Add new tools here — one place only.
// Each builder receives the normalized result and returns an asset row or null.
// ---------------------------------------------------------------------------

type AssetRow = {
  type: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
};

const ASSET_REGISTRY: Partial<
  Record<string, (result: NormalizedToolResult) => AssetRow | null>
> = {
  format_post: ({ input, output }) => {
    const value = (output as any)?.value ?? output;
    let content = value?.content ?? "";
    if (value?.hashtags?.length > 0) {
      content += "\n\n" + value.hashtags.join(" ");
    }
    if (!content) return null;
    return {
      type: "social_post",
      title: String(input.topic ?? content.split("\n")[0]).slice(0, 100),
      content,
      metadata: { platform: input.platform },
    };
  },

  generate_outline: ({ input, output }) => {
    const value = (output as any)?.value ?? output;
    const parsed = typeof value === "string" ? JSON.parse(value) : value;

    // Convert to markdown — this is what the user sees and copies
    const md = outlineToMarkdown(parsed);

    return {
      type: "post_outline",
      title: String(input.topic ?? parsed?.title ?? "Outline").slice(0, 100),
      content: md, // readable markdown
      metadata: {
        platform: input.platform,
        outline: parsed, // original JSON preserved
      },
    };
  },

  generate_image: ({ input, output }) => {
    const value = (output as any)?.value ?? output;
    const imageUrl = value?.imageUrl ?? value;
    if (!imageUrl) return null;
    return {
      type: "image",
      title: "Generated image",
      content: String(imageUrl),
      metadata: { prompt: input.visualPrompt ?? input.prompt },
    };
  },

  format_reel: ({ input, output }) => {
    const value = (output as any)?.value ?? output;
    if (!value?.captionText) return null;
    const content =
      value.captionText +
      (value.hashtags?.length > 0
        ? "\n\n" + value.hashtags.join(" ")
        : "");
    return {
      type: "reel_script",
      title: String(
        value.title ?? input.topic ?? content.split("\n")[0],
      ).slice(0, 100),
      content,
      metadata: {
        platform: input.platform,
        sceneCount: value.scenes?.length ?? 0,
      },
    };
  },

  format_script: ({ input, output }) => {
    const value = (output as any)?.value ?? output;
    if (!value?.title) return null;
    return {
      type: "script",
      title: String(value.title ?? input.topic ?? "Script").slice(0, 100),
      content: scriptToMarkdown(value),
      metadata: {
        format: input.format,
        estimatedRuntime: value.estimatedRuntime ?? "",
      },
    };
  },

  generate_thumbnail_concept: ({ input, output }) => {
    const value = (output as any)?.value ?? output;
    const concepts = value?.concepts;
    if (!concepts?.length) return null;
    const lines: string[] = [];
    for (const c of concepts) {
      lines.push(`## Concept ${c.conceptNumber}: ${c.title}`, "");
      lines.push(
        `**Colors:** ${c.colorScheme.primary} / ${c.colorScheme.accent} on ${c.colorScheme.background}`,
      );
      if (c.textOverlays?.length > 0) {
        lines.push(`**Text:** ${c.textOverlays.join(" | ")}`);
      }
      lines.push(`**Composition:** ${c.compositionDescription}`, "");
    }
    return {
      type: "thumbnail",
      title: String(input.topic ?? "Thumbnail Concepts").slice(0, 100),
      content: lines.join("\n").trim(),
      metadata: { platform: input.platform, conceptCount: concepts.length },
    };
  },

  extract_receipt_data: ({ input, output }) => {
    const value = (output as any)?.value ?? output;
    if (!value || value.error) return null;

    const lines: string[] = [];
    if (value.merchant) lines.push(`**Merchant:** ${value.merchant}`);
    if (value.date) lines.push(`**Date:** ${value.date}`);
    if (value.receiptNumber) lines.push(`**Receipt #:** ${value.receiptNumber}`);
    lines.push("");

    if (value.items?.length > 0) {
      lines.push("| Item | Qty | Unit Price | Total |");
      lines.push("| --- | --- | --- | --- |");
      for (const item of value.items) {
        lines.push(
          `| ${item.name} | ${item.quantity ?? "-"} | ${item.unitPrice ?? "-"} | ${item.totalPrice ?? "-"} |`,
        );
      }
      lines.push("");
    }

    if (value.subtotal != null) lines.push(`**Subtotal:** ${value.subtotal}`);
    if (value.tax != null) lines.push(`**Tax:** ${value.tax}`);
    if (value.tip != null) lines.push(`**Tip:** ${value.tip}`);
    if (value.total != null) lines.push(`**Total:** ${value.total}`);
    if (value.currency) lines.push(`**Currency:** ${value.currency}`);
    if (value.paymentMethod) lines.push(`**Payment:** ${value.paymentMethod}`);

    const title = String(
      value.merchant ?? `Receipt ${value.date ?? ""}`,
    ).slice(0, 100);

    return {
      type: "receipt",
      title,
      content: lines.join("\n").trim(),
      metadata: {
        total: value.total,
        currency: value.currency,
        itemCount: value.items?.length ?? 0,
      },
    };
  },

  analyze_legal_document: ({ input, output }) => {
    const value = (output as any)?.value ?? output;
    if (!value || value.error || !value.summary) return null;

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
        lines.push(
          `${badge(r.level)} **${r.level.toUpperCase()}**: ${r.description}`,
        );
      }
    }

    if (value.recommendations?.length > 0) {
      lines.push("\n## Recommendations\n");
      for (const rec of value.recommendations) lines.push(`- ${rec}`);
    }

    const highRisks =
      value.risks?.filter((r: any) => r.level === "high").length ?? 0;

    return {
      type: "legal_analysis",
      title: String(
        `${value.documentType ?? "Legal Document"} Analysis`,
      ).slice(0, 100),
      content: lines.join("\n").trim(),
      metadata: {
        documentType: value.documentType,
        riskCount: value.risks?.length ?? 0,
        highRisks,
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 4. extractAndSaveAssets
//
// Processes normalized tool results through the registry and bulk-inserts.
// No longer needs a separate toolResults argument — normalizeToolResults
// handles all result shapes in one pass.
// ---------------------------------------------------------------------------

export async function extractAndSaveAssets(
  toolResults: NormalizedToolResult[],
  context: AssetContext,
): Promise<void> {
  const { teamId, conversationId, runId } = context;

  const rows = toolResults.flatMap((result) => {
    const builder = ASSET_REGISTRY[result.toolName];
    if (!builder) return [];

    const asset = builder(result);
    if (!asset) return [];

    return [{ teamId, conversationId, runId, ...asset }];
  });

  if (rows.length === 0) return;

  try {
    await db.insert(assets).values(rows);
  } catch (err) {
    console.error("[assets] failed to save:", err);
  }
}

// ---------------------------------------------------------------------------
// 5. resolveApprovalPendingParts
//
// When tool results arrive for previously approval-gated parts, update those
// message rows in the DB. Extracted so it can be awaited cleanly.
// ---------------------------------------------------------------------------

async function resolveApprovalPendingParts(
  conversationId: string,
  toolResultsToUpdate: ToolResultPart[],
): Promise<NormalizedToolResult[]> {
  // ← now returns enriched results
  if (toolResultsToUpdate.length === 0) return [];

  const toolCallIds = toolResultsToUpdate.map((r) => r.toolCallId);

  const hasApprovalPending = (ids: string[]) =>
    sql`${messagesTable.parts} @> ANY(ARRAY[${sql.join(
      ids.map(
        (id) =>
          sql`${JSON.stringify([{ toolCallId: id, state: "approval-requested" }])}::jsonb`,
      ),
      sql`, `,
    )}])`;

  const savedMessage = await db.query.messages.findFirst({
    where: and(
      eq(messagesTable.conversationId, conversationId),
      hasApprovalPending(toolCallIds),
    ),
  });

  if (!savedMessage) return [];

  const updatedParts: any[] = [];
  const enrichedResults: NormalizedToolResult[] = []; // ← collect here

  for (const part of savedMessage.parts as any[]) {
    const match = toolResultsToUpdate.find(
      (r) =>
        r.toolCallId === part.toolCallId && part.state === "approval-requested",
    );

    if (!match) {
      updatedParts.push(part);
      continue;
    }

    updatedParts.push({
      ...part,
      state: "output-available",
      output: match.output,
    });

    // The saved part already has toolName and input from when it was first saved
    enrichedResults.push({
      toolCallId: part.toolCallId,
      toolName: part.type.replace("tool-", ""), // e.g. "tool-format_post" → "format_post"
      input: part.input ?? {},
      output: match.output,
    });
  }

  await db
    .update(messagesTable)
    .set({ parts: updatedParts })
    .where(eq(messagesTable.id, savedMessage.id));

  return enrichedResults;
}

// ---------------------------------------------------------------------------
// 6. saveAgentResponse  ← the public entry point
//
// Orchestrates the above utilities in order:
//   a. Snapshot messages (normalizeToolResults mutates nothing, but safe habit)
//   b. Build UI parts + detect approval state
//   c. Insert assistant message
//   d. Extract + save assets from all tool results in one pass
//   e. Resolve any approval-pending parts
//
// Returns toolNeedsApproval so the caller can decide whether to pause the run.
// ---------------------------------------------------------------------------

// export async function saveAgentResponse(
//   response: any,
//   context: AssetContext,
// ): Promise<boolean> {
//   const messages: any[] = response.messages;

//   // a. Normalize all tool results in one pass — covers both normal + approval paths
//   const toolResults = normalizeToolResults(messages);

//   console.log("[saveAgentResponse] normalized tool results:", toolResults);

//   // b. Build UI message parts
//   const { parts, toolNeedsApproval } = buildMessageParts(messages);

//   // c. Insert assistant message
//   if (parts.length > 0) {
//     await db.insert(messagesTable).values({
//       sdkId: generateId(),
//       conversationId: context.conversationId,
//       role: "assistant",
//       parts: parts as any,
//     });
//   }

//   // d. Extract and save assets — single registry, no duplication
//   await extractAndSaveAssets(toolResults, context);

//   // e. Resolve approval-pending parts if any tool results came back
//   const rawToolResults = messages
//     .filter((m) => m.role === "tool" && Array.isArray(m.content))
//     .flatMap((m) => m.content as ToolContent)
//     .filter((c): c is ToolResultPart => c.type === "tool-result");

//   console.log("rawToolResults:", rawToolResults);

//   await resolveApprovalPendingParts(context.conversationId, rawToolResults);

//   return toolNeedsApproval;
// }

export async function saveAgentResponse(
  response: any,
  context: AssetContext,
): Promise<boolean> {
  const messages: any[] = response.messages;

  // a. Normalize all tool results in one pass (normal path)
  const toolResults = normalizeToolResults(messages);

  // b. Build UI parts
  const { parts, toolNeedsApproval } = buildMessageParts(messages);

  // c. Insert assistant message
  if (parts.length > 0) {
    await db.insert(messagesTable).values({
      sdkId: generateId(),
      conversationId: context.conversationId,
      role: "assistant",
      parts: parts as any,
    });
  }

  // d. Save assets from normal tool results
  await extractAndSaveAssets(toolResults, context);

  // e. Collect raw tool results (approval path)
  const rawToolResults = messages
    .filter((m) => m.role === "tool" && Array.isArray(m.content))
    .flatMap((m) => m.content as ToolContent)
    .filter((c): c is ToolResultPart => c.type === "tool-result");

  // h. Resolve approval-pending parts + get enriched results for asset extraction
  const approvalToolResults = await resolveApprovalPendingParts(
    context.conversationId,
    rawToolResults,
  );

  // i. Save assets from approval-path results — input comes from the saved DB part
  if (approvalToolResults.length > 0) {
    await extractAndSaveAssets(approvalToolResults, context);
  }

  return toolNeedsApproval;
}
