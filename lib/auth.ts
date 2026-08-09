import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { env } from "@/env.mjs";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/account";
import { sendEmailVerificationOTP } from "@/lib/mails/auth-emails";

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
        // The starter is single-workspace: every session automatically points at
        // the team created for the user at sign-up, so there is no picker.
        before: async (session) => {
          const membership = await db.query.teamMembers.findFirst({
            where: eq(schema.teamMembers.userId, session.userId),
          });

          return {
            data: {
              ...session,
              activeOrganizationId: membership?.teamId ?? null,
            },
          };
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
        // The plugin reads invitations as part of getFullOrganization, which
        // runs on every dashboard load, so this model has to resolve even
        // though the starter ships no invitation flow. See the table comment
        // in lib/db/schema/account.ts.
        invitation: {
          modelName: "invitation",
          fields: {
            organizationId: "teamId",
          },
        },
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
