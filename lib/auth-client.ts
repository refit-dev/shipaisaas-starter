import {
  adminClient,
  emailOTPClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Better-Auth usually infers this automatically in Next.js,
  // but it's best practice to declare it explicitly
  baseURL: process.env.NEXT_PUBLIC_APP_URL,

  plugins: [
    organizationClient(),
    adminClient(),
    magicLinkClient(),
    emailOTPClient(),
  ],
});
