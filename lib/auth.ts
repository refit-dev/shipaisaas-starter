import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, magicLink, organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { nanoid } from "nanoid";

import { env } from "@/env.mjs";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/account";
import {
  sendEmailVerificationEmail,
  sendEmailVerificationOTP,
  sendInvitationEmail,
  sendMagicLinkEmail,
} from "@/lib/mails/auth-emails";

// 1. Define the actions that can be performed on a "user" entity
const statement = {
  user: ["create", "update", "delete", "ban", "set-role", "list"],
} as const;

const ac = createAccessControl(statement);

// 2. Create the "God Mode" role with all permissions granted
const superAdminRole = ac.newRole({
  user: ["create", "update", "delete", "ban", "set-role", "list"],
});

const adminRole = ac.newRole({
  user: ["create", "update", "ban", "set-role", "list"],
});

// 3. Create a restricted role for standard users (no admin permissions)
const standardUserRole = ac.newRole({
  user: [],
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
    usePlural: true,
  }),

  // Better-auth uses 'email' field in users table for auth
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const teamId = nanoid();

          // 2. Create the default team
          await db.insert(schema.teams).values({
            id: teamId,
            name: `${user.name}'s Organization`,
            email: user.email, // Populating your custom SaaS field
            slug: `${user.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // 3. Assign the new user as the 'owner' of this team
          await db.insert(schema.teamMembers).values({
            teamId: teamId,
            userId: user.id,
            role: "owner",
          });
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          // Log sign-ins!
        },
      },
    },
  },

  plugins: [
    organization({
      // 1. Correct Schema Mapping Syntax
      schema: {
        organization: {
          modelName: "team", // Tells Better Auth to use the 'teams' table
          // NEW: Tell Better Auth to include these custom Drizzle columns in the client payload
          additionalFields: {
            email: {
              type: "string",
              required: true,
            },
            onboardingCompleted: {
              type: "boolean",
              required: false,
              defaultValue: false,
            },
          },
        },
        member: {
          modelName: "teamMember",
          fields: {
            organizationId: "teamId", // Maps Better-Auth's internal 'organizationId' to your Drizzle 'teamId' property
          },
        },
        invitation: {
          modelName: "invitation",
          fields: {
            organizationId: "teamId", // Same mapping here
          },
        },
      },
      // Hook into team events
      //   hooks: {
      //     organizationCreated: async (org, user) => {
      //        await logActivity(org.id, user.id, ActivityType.CREATE_TEAM);
      //     },
      //     memberAdded: async (member, org) => {
      //        await logActivity(org.id, member.userId, ActivityType.ACCEPT_INVITATION);
      //     }
      //   },

      // 2. Correct Email Hook
      async sendInvitationEmail({ id, email, role, organization }) {
        // We construct the invite link manually using the generated invitation 'id'
        const inviteUrl = `${env.NEXT_PUBLIC_APP_URL}/accept-invite?id=${id}`;

        await sendInvitationEmail(email, organization.name, role, inviteUrl);
      },
    }),

    admin({
      // Tell Better Auth these are your valid admin strings
      adminRoles: ["admin", "superadmin"],

      // Inject your explicit access control rules
      ac: ac,
      roles: {
        admin: adminRole,
        superadmin: superAdminRole,
        user: standardUserRole,
      },
    }),

    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
    }),
    emailOTP({
      // Tell Better Auth to automatically send the OTP on signup
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification" || type === "forget-password") {
          // Pass the Better-Auth generated 6-digit 'otp' directly to Resend
          await sendEmailVerificationOTP(email, otp);
        }
      },
    }),
  ],
});
