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
    date: "August 9, 2026",
    tag: "Design",
    title: "A new look",
    description:
      "The starter now ships with a real design system rather than default component styling — a brand palette, a type scale, a motion budget and a rebuilt marketing site. Everything is driven by CSS variables in styles/globals.css, so repointing it at your own brand is one file.",
    changes: [
      "Light and dark themes on a brand palette, with a two-state toggle (no system option)",
      "Plus Jakarta Sans for headings, DM Sans for body, JetBrains Mono for code",
      "A motion budget: the hero settles in roughly 0.65s instead of 3.4s, and scroll reveals are 250ms",
      "Rebuilt landing page — hero, feature bento, spec list, install timeline, testimonials and pricing",
      "Rounded card language throughout, plus a real elevation scale and a brand-derived chart ramp",
      "Blog, pricing comparison table and changelog restyled to match",
    ],
  },
  {
    date: "August 9, 2026",
    tag: "Fix",
    title: "Metadata and social cards",
    description:
      "Several metadata fields were silently wrong, so pages shared to social networks came out untitled or carrying the wrong image.",
    changes: [
      "Open Graph carried no images — every blog post shared to Facebook, LinkedIn or Slack used the generic site image instead of its own",
      "og:title and twitter:title were empty on any page that did not pass an explicit title, including the landing page",
      "og:site_name held the page title rather than the site name",
      "The landing page has its own title, description and canonical URL",
      "Keywords rewritten around real search terms, and both keywords and canonical are now per-page overridable",
    ],
  },
  {
    date: "August 9, 2026",
    tag: "Fix",
    title: "Restored the invitations table",
    description:
      "Better-Auth's organization plugin owns three models — organization, member and invitation — and they are not independently optional. With the invitations table missing, getFullOrganization threw on every authenticated page load. If you cloned before this, run `npm run db:migrate` to apply the new migration.",
    changes: [
      "invitations is back in the schema with its plugin mapping, as migration 0001",
      "The table ships empty: no invite UI, no accept route, no invitation email hook",
      "The organization plugin's invitation API is wired, so adding invites is UI work rather than schema work",
    ],
  },
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
