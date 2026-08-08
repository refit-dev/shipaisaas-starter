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

export async function sendPasswordResetEmail(email: string, url: string) {
  await resend.emails.send({
    from: mailFrom,
    to: email,
    subject: `Reset your ${appName} password`,
    html: `<p>Click <a href="${url}">here</a> to choose a new password. This link expires in one hour.</p>`,
  });
}
