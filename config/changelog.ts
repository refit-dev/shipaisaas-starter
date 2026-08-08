export type ChangelogTag = "Feature" | "Improvement" | "Fix" | "Design";

export type ChangelogEntry = {
  /** Shown on the left rail, e.g. "August 8, 2026". */
  date: string;
  tag: ChangelogTag;
  title: string;
  description: string;
  /** Bullet list of what actually changed. */
  changes: string[];
};

/**
 * Your product's changelog, newest first. Add an entry here and it appears
 * at /changelog — there is no other wiring.
 */
export const changelog: ChangelogEntry[] = [
  {
    date: "August 8, 2026",
    tag: "Feature",
    title: "Initial release",
    description:
      "The first public release of the starter: a complete SaaS foundation with authentication, a database, subscriptions, transactional email and a working AI layer.",
    changes: [
      "Better-Auth with email/password, Google OAuth, email verification and password reset",
      "Drizzle ORM on Postgres with typed schemas and a CLI migration workflow",
      "Three Stripe subscription tiers with Checkout, the customer portal and webhooks",
      "Streaming chat on the Vercel AI SDK with persisted history and a model picker",
      "Task templates with structured JSON output validated against a Zod schema",
      "Per-plan daily and monthly request caps enforced before any model call",
      "Admin area for users, workspaces and usage",
      "Marketing site with an MDX blog and help centre",
    ],
  },
];
