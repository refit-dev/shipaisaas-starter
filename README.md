# Ship AI SaaS Starter

The open source AI SaaS starter. Auth, database, subscriptions, transactional email and a streaming AI layer, wired together in a Next.js 16 app you can deploy today.

MIT licensed — fork it, change it, and sell whatever you build with it.

## What's in the box

| Area          | What you get                                                                           |
| ------------- | -------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui                            |
| Auth          | Better-Auth — email/password, Google OAuth, email verification, password reset           |
| Database      | Drizzle ORM on Postgres, typed schemas, CLI migrations                                   |
| Payments      | Stripe — three subscription tiers, Checkout, customer portal, webhooks                   |
| Email         | Resend for transactional mail                                                            |
| AI            | Vercel AI SDK — streaming chat with persisted history, model picker, structured output    |
| Usage         | Per-plan daily and monthly request caps, enforced server-side, with token counts recorded |
| Marketing     | Landing page, pricing, MDX blog and help centre via Contentlayer                          |
| Admin         | Users, workspaces and usage overview for app admins                                       |

## Prerequisites

- Node.js 20+
- A PostgreSQL database ([Supabase](https://supabase.com) and [Neon](https://neon.tech) both work)
- API keys for OpenAI (or Anthropic), Resend and Stripe

## Quick start

```bash
git clone https://github.com/jeanchrinot/shipaisaas-starter.git my-app
cd my-app
npm install
cp .env.example .env
```

Fill in `.env`, then create the schema and start the app:

```bash
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up. A workspace is created for you on first sign-up.

New here? [STARTUP.md](./STARTUP.md) walks through the whole setup, including how to get each API key.

## Commands

| Command               | What it does                                 |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Start the dev server                         |
| `npm run build`       | Production build                             |
| `npm run lint`        | ESLint                                       |
| `npm run db:generate` | Generate a migration from schema changes     |
| `npm run db:migrate`  | Apply pending migrations                     |
| `npm run db:push`     | Push the schema without a migration file     |
| `npm run db:studio`   | Open Drizzle Studio                          |

## Project structure

```
app/
  (marketing)/        Landing, pricing, blog
  (docs)/             Help centre
  (app)/(auth)/       Login, signup, verification
  (app)/(protected)/  Dashboard, tasks, usage, billing, admin
  api/chat/           Chat stream, history, conversations
  api/tasks/generate/ Task template runner
components/           UI, sections, dashboard, assistant
config/
  ai.ts               System prompt, history window, temperature
  tasks.ts            Task templates
  subscriptions.ts    Plans, prices and usage limits
  site.ts             Site name, links, footer
lib/
  ai/                 chat.ts, structured.ts, models.ts
  db/                 Drizzle schema and migrations
  auth.ts             Better-Auth configuration
  utils/usage.ts      Usage recording and rate limits
```

## The three files you'll edit first

1. **`config/ai.ts`** — the system prompt and model behaviour.
2. **`config/tasks.ts`** — add a template and a new page appears under `/dashboard/tasks`.
3. **`config/subscriptions.ts`** — your plans, prices and per-plan request caps.

## Deploying

Deploy to Vercel, set the same environment variables, and point a Stripe webhook at `https://yourdomain.com/api/webhooks/stripe` (events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`).

## Going further

Building agentic features — tool calls streamed into the UI, human-in-the-loop approvals, background execution, token-level credit metering, multi-tenant teams — is what [Ship AI SaaS Pro](https://shipaisaas.com) adds on top of this foundation.

## License

MIT. See [LICENSE.md](./LICENSE.md).
