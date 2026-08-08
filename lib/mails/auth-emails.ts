import { Resend } from "resend";

import { env } from "@/env.mjs";

const resend = new Resend(env.RESEND_API_KEY);
const appName = env.APP_NAME;
const mailFrom = env.EMAIL_FROM;

// Better-Auth handles the token and URL generation
export async function sendEmailVerificationEmail(
  email: string,
  url: string,
  userName?: string,
) {
  await resend.emails.send({
    from: mailFrom,
    to: email,
    subject: `Verify your email for ${appName}`,
    html: `<p>Hello ${userName || "there"}, click <a href="${url}">here</a> to verify your email.</p>`,
  });
}

export async function sendEmailVerificationOTP(email: string, otp: string) {
  await resend.emails.send({
    from: mailFrom,
    to: email,
    subject: `Verify your email for ${appName}`,
    html: `<p>Hello there, use the code <strong>${otp}</strong> to verify your email.</p>`,
  });
}

export async function sendMagicLinkEmail(email: string, url: string) {
  await resend.emails.send({
    from: mailFrom,
    to: email,
    subject: `Sign in to ${appName}`,
    html: `<p>Click <a href="${url}">here</a> to sign in instantly.</p>`,
  });
}

export async function sendInvitationEmail(
  email: string,
  teamName: string,
  role: string,
  url: string,
) {
  await resend.emails.send({
    from: mailFrom,
    to: email,
    subject: `You're invited to join ${teamName}`,
    html: `
      <h1>Join ${teamName}</h1>
      <p>You've been invited as a <strong>${role}</strong>.</p>
      <a href="${url}" style="background: #FF6B6B; color: white; padding: 10px 20px; text-decoration: none;">Accept Invitation</a>
    `,
  });
}
