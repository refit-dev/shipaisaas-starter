# Ship AI SaaS Starter — Developer Context

An open source (MIT) Next.js starter for AI SaaS products: auth, Postgres,
Stripe subscriptions, transactional email and a direct Vercel AI SDK layer.

## Architecture

The AI layer is deliberately flat — a request goes straight to a model, with no
orchestrator, agents, tools or background queue.

- **`lib/ai/chat.ts`** — `streamChat()`, the single `streamText` entry point.
  Streams to the client and persists the finished assistant message.
- **`lib/ai/structured.ts`** — `generatePlainText()` and `generateStructured()`
  for one-shot task templates.
- **`lib/ai/models.ts`** — the supported models and `resolveModel()`.
- **`config/ai.ts`** — system prompt, history window, temperature.

Routes: `app/api/chat/` (stream, history, conversations) and
`app/api/tasks/generate/` (runs a template from `config/tasks.ts`).

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19
- **Auth:** Better-Auth (email/password, Google, email OTP verification)
- **Database:** PostgreSQL + Drizzle ORM
- **Payments:** Stripe (three subscription tiers)
- **Email:** Resend
- **AI:** Vercel AI SDK (`@ai-sdk/openai`, `@ai-sdk/anthropic`)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Content:** Contentlayer (MDX blog and help centre)

## Data model

Twelve tables. `users`, `sessions`, `accounts`, `verifications` come from
Better-Auth; `teams` and `team_members` hold the workspace and its Stripe state;
`daily_usages` and `monthly_usages` hold request and token counters;
`conversations` and `messages` hold chat history; `activity_logs` is available
for auditing.

**Single workspace.** Each user gets one team, created by the user-create hook
in `lib/auth.ts`, and the session's `activeOrganizationId` is set on session
creation. There is no member management or org roles — those are premium
features. Every tenant-scoped query filters by `teamId`.

`invitations` is the twelfth table and is intentionally empty. Better-Auth's
organization plugin owns it, and `getFullOrganization` — which runs on every
dashboard load — reads it, so the table has to exist for the Drizzle adapter to
resolve the model. The starter ships no invite UI, accept route or
`sendInvitationEmail` hook, so nothing writes to it. The plugin's invitation
API is live if you want to build on it.

## Coding conventions

1. **Never use `generateObject`.** Use `generateText` with `Output` from the
   Vercel AI SDK — see `lib/ai/structured.ts`.
2. **Rate limit before you spend tokens.** Every AI entry point calls
   `checkRateLimits()` first and `updateUsage()` after. One chat message or task
   run is one request.
3. **Use `withAuth`** (`lib/auth/middleware.ts`) for authenticated API routes
   rather than re-checking sessions by hand.
4. **Schema changes go through Drizzle.** Edit `lib/db/schema/`, then
   `npm run db:generate` and `npm run db:migrate`. Never hand-edit migrations.
5. **Theme-only colours in UI.** No hardcoded Tailwind palette classes
   (`text-blue-600`, `bg-rose-50`, …) or inline hex. Use the semantic tokens
   from `styles/globals.css`: `bg-background`, `bg-card`, `bg-muted`,
   `bg-accent`, `bg-primary`, `bg-secondary`, `bg-destructive`,
   `text-foreground`, `text-muted-foreground`, `text-primary`, `border`, `ring`,
   `chart-1`–`chart-5` and their sidebar equivalents.
6. **English only.** i18n is not part of this starter; write user-facing strings
   inline.

## Verifying changes

```bash
npm run lint        # must stay at 0 errors
npm run build       # type checks and builds
npm run db:studio   # inspect data
```
