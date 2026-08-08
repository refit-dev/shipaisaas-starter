import { convertToModelMessages, ToolLoopAgent, UIMessage } from "ai";
import { and, eq } from "drizzle-orm";

import { resolveModel } from "@/lib/ai/models";
import { analyzeLegalDocumentTool } from "@/lib/ai/tools/shared/analyze-legal-document";
import { readDocumentTool } from "@/lib/ai/tools/shared/read-document";
import { sendAnalysisEmailTool } from "@/lib/ai/tools/shared/send-analysis-email";
import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema/agent";

import { saveAgentResponse } from "../utils";

export const maxDuration = 120;

export async function streamLegalAnalyzerAgent(
  messages: UIMessage[],
  team: any,
  conversationId: string,
  modelId?: string,
) {
  const tools = {
    read_document: readDocumentTool,
    analyze_legal_document: analyzeLegalDocumentTool,
    send_analysis_email: sendAnalysisEmailTool,
  };

  const legalAgent = new ToolLoopAgent({
    model: resolveModel(modelId),
    tools,
    instructions: `
      You are an expert Legal Document Analyzer. Your job is to read and analyze legal documents, then optionally send the analysis to a client.

      Execution Workflow:
      1. Determine the document source from the user's message:
         a. If the message contains "[Attached document: <url>]" → call 'read_document' first to extract the text, then proceed to step 2.
         b. If the user has pasted or typed legal text directly → use that text directly in step 2 (skip 'read_document').
         c. If neither a URL nor legal text is present → ask the user to either attach a PDF or paste the document text.
      2. Call 'analyze_legal_document' with the document text (whether extracted from a PDF or provided directly).
         Pass a 'documentType' hint if identifiable, otherwise null.
      3. After the analysis completes, present the findings clearly in Markdown:
         - Plain-language summary first.
         - Key parties and dates.
         - Obligations grouped by party.
         - Risks: 🔴 High first, then 🟡 Medium, then 🟢 Low.
         - Key dates as a timeline.
         - Recommendations at the end.
      4. After presenting results, ask the user: "Would you like me to email this analysis to a client?"
         - If yes, ask for the recipient's email address and optional name.
         - Call 'send_analysis_email' with the complete output object from 'analyze_legal_document' passed as 'analysisData'.
           Do NOT compose your own markdown — pass the raw tool result object directly.

      STRICT RULES:
      - NEVER write a legal analysis yourself without using 'analyze_legal_document'.
      - If a document URL is present, ALWAYS call 'read_document' before 'analyze_legal_document' — never skip it.
      - If 'read_document' returns an error, report it clearly and ask the user to verify the URL or re-upload.
      - If the user provides text directly, pass it straight to 'analyze_legal_document' without calling 'read_document'.
      - When calling 'send_analysis_email', ALWAYS pass the raw output object from 'analyze_legal_document' as 'analysisData'. NEVER compose your own text for this field.
    `,
    prepareCall: async (settings) => {
      const coreMemoryRecord = await db.query.memories.findFirst({
        where: and(eq(memories.teamId, team.id), eq(memories.key, "core")),
      });
      const coreMemoryText =
        coreMemoryRecord?.content ?? "No core memory set yet.";
      return {
        ...settings,
        instructions: `
          ${settings.instructions}

          --- TEAM CORE MEMORY ---
          ${coreMemoryText}
          ------------------------
        `,
      };
    },
    onStepFinish: async () => {},
    onFinish: async ({ response }) => {
      await saveAgentResponse(response, { conversationId, teamId: team.id });
    },
  });

  const modelMessages = await convertToModelMessages(messages);
  const result = await legalAgent.stream({ prompt: modelMessages });
  return result;
}
