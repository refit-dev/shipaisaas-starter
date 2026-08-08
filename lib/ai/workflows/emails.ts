import { Resend } from "resend";

import { WORKFLOW_TOOL_CONFIG } from "./tool-config";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "noreply@yourdomain.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlanStep {
  stepIndex: number;
  description: string;
  toolName: string;
  requiresApproval?: boolean;
}

export interface SendPlanApprovalOptions {
  to: string;
  workflowId: string;
  workflowTitle: string;
  goal: string;
  steps: PlanStep[];
  token: string;
}

export interface SendStepApprovalOptions {
  to: string;
  workflowId: string;
  runNumber: number;
  conversationId: string;
  workflowTitle: string;
  stepDescription: string;
  approvalPrompt: string;
  toolOutput: string; // stringified preview of what the tool produced
  token: string;
}

export interface SendRunCompletedOptions {
  to: string;
  workflowTitle: string;
  workflowId: string;
  runNumber: number;
}

export interface SendRunFailedOptions {
  to: string;
  workflowTitle: string;
  workflowId: string;
  runNumber: number;
  stepDescription: string;
  error: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function approveUrl(
  token: string,
  action: "approve" | "reject",
  note?: string,
) {
  const url = new URL(`${APP_URL}/api/workflows/resume`);
  url.searchParams.set("token", token);
  url.searchParams.set("action", action);
  if (note) url.searchParams.set("note", note);
  return url.toString();
}

function stepBadge(toolName: string) {
  const cfg = WORKFLOW_TOOL_CONFIG.find((t) => t.name === toolName);
  return cfg ? `${cfg.emoji} ${cfg.label}` : toolName;
}

// ---------------------------------------------------------------------------
// 1. Plan approval — sent when a new workflow is created, before first run
// ---------------------------------------------------------------------------

export async function sendPlanApprovalEmail(opts: SendPlanApprovalOptions) {
  const { to, workflowTitle, goal, steps, token } = opts;

  const approveLink = `${APP_URL}/api/workflows/${opts.workflowId}/approve?token=${token}`;

  const stepsHtml = steps
    .map(
      (s) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">
          ${s.stepIndex + 1}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;">
          ${s.description}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;">
          ${stepBadge(s.toolName)}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;">
          ${(s as any).requiresApproval ? "⏸ Yes" : "—"}
        </td>
      </tr>`,
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Approve workflow plan: ${workflowTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <h2 style="margin-bottom:4px;">${workflowTitle}</h2>
        <p style="color:#555;margin-top:0;">Review and approve the plan before your first run.</p>

        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em;">Goal</p>
          <p style="margin:6px 0 0;font-size:15px;">${goal}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead>
            <tr style="background:#f4f4f4;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;">#</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;">Step</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;">Tool</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;">Pauses?</th>
            </tr>
          </thead>
          <tbody>${stepsHtml}</tbody>
        </table>

        <a href="${approveLink}"
           style="display:inline-block;background:#18181b;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:500;margin-top:8px;">
          Approve &amp; Activate
        </a>

        <p style="margin-top:24px;font-size:12px;color:#aaa;">
          This link expires in 24 hours. If you did not request this, ignore this email.
        </p>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// 2. Step approval — sent mid-run when a step has requiresApproval = true
// ---------------------------------------------------------------------------

export async function sendStepApprovalEmail(opts: SendStepApprovalOptions) {
  const {
    to,
    workflowTitle,
    stepDescription,
    approvalPrompt,
    toolOutput,
    token,
    workflowId,
    runNumber,
  } = opts;

  const approveLink = approveUrl(token, "approve");
  const rejectLink = approveUrl(token, "reject");
  const chatLink = `${APP_URL}/dashboard/workflows/${workflowId}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Action needed: ${workflowTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <h2 style="margin-bottom:4px;">${workflowTitle}</h2>
        <p style="color:#555;margin-top:0;">A workflow step needs your approval to continue.</p>

        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em;">Step</p>
          <p style="margin:6px 0 0;font-size:15px;">${stepDescription}</p>
        </div>

        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em;">Question</p>
          <p style="margin:6px 0 0;font-size:15px;">${approvalPrompt}</p>
        </div>

        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em;">Output preview</p>
          <pre style="margin:0;font-size:13px;white-space:pre-wrap;word-break:break-word;color:#333;">${toolOutput.slice(0, 1200)}${toolOutput.length > 1200 ? "\n\n…(truncated)" : ""}</pre>
        </div>

        <div style="display:flex;gap:12px;margin-top:8px;">
          <a href="${approveLink}"
             style="display:inline-block;background:#18181b;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:500;">
            ✅ Approve
          </a>
          <a href="${rejectLink}"
             style="display:inline-block;background:#fff;color:#18181b;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:500;border:1px solid #e0e0e0;">
            ✏️ Request changes
          </a>
        </div>

        <p style="margin-top:20px;">
          <a href="${chatLink}" style="color:#555;font-size:13px;">View full conversation →</a>
        </p>

        <p style="margin-top:24px;font-size:12px;color:#aaa;">
          Run #${runNumber} · This link expires in 2 hours.
        </p>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// 3. Run completed — sent when all steps finish successfully
// ---------------------------------------------------------------------------

export async function sendRunCompletedEmail(opts: SendRunCompletedOptions) {
  const { to, workflowTitle, workflowId, runNumber } = opts;
  const chatLink = `${APP_URL}/dashboard/workflows/${workflowId}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `✅ ${workflowTitle} — run #${runNumber} completed`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <h2 style="margin-bottom:4px;">${workflowTitle}</h2>
        <p style="color:#555;margin-top:0;">Run #${runNumber} completed successfully.</p>

        <a href="${chatLink}"
           style="display:inline-block;background:#18181b;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:500;margin-top:8px;">
          View results →
        </a>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// 4. Run failed — sent when a step throws an unrecoverable error
// ---------------------------------------------------------------------------

export async function sendRunFailedEmail(opts: SendRunFailedOptions) {
  const { to, workflowTitle, workflowId, runNumber, stepDescription, error } =
    opts;
  const chatLink = `${APP_URL}/dashboard/workflows/${workflowId}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `❌ ${workflowTitle} — run #${runNumber} failed`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <h2 style="margin-bottom:4px;">${workflowTitle}</h2>
        <p style="color:#555;margin-top:0;">Run #${runNumber} failed at the step below.</p>

        <div style="background:#fff5f5;border-radius:8px;padding:16px;margin:20px 0;border:1px solid #fecaca;">
          <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em;">Failed step</p>
          <p style="margin:6px 0 0;font-size:15px;">${stepDescription}</p>
          <p style="margin:12px 0 0;font-size:13px;color:#b91c1c;font-family:monospace;">${error}</p>
        </div>

        <a href="${chatLink}"
           style="display:inline-block;background:#18181b;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:500;">
          View workflow →
        </a>
      </div>
    `,
  });
}
