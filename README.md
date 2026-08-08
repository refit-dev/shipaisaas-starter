# Ship AI SaaS

Production-ready AI SaaS boilerplate built on the Orchestrator → Agent → Tool paradigm. Every route, workflow, and background job is wired up from the first `npm run dev`.

## Prerequisites

- Node.js 20+
- A PostgreSQL database ([Supabase](https://supabase.com) recommended)
- API keys for: OpenAI, Resend, Supabase, Stripe, Upstash

## Quick Start

**1. Clone and install**

```bash
git clone git@github.com:jeanchrinot/shipaisaas.git my-app
cd my-app
npm install
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

Fill in your keys. Every required variable is documented at [shipaisaas.com/docs/environment-variables](https://shipaisaas.com/docs/environment-variables).

**3. Run database migrations**

```bash
npm run db:generate
npm run db:migrate
```

This creates all 14 tables across the three schema files.

**4. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up — a team is created automatically on first registration.

## Database Commands

| Command               | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm run db:generate` | Generate migration files from schema changes |
| `npm run db:migrate`  | Apply pending migrations                     |
| `npm run db:studio`   | Open the visual database browser             |

## Project Structure (Essentials Only)

```
app/                  Next.js App Router — pages, layouts, API routes
components/           UI components
lib/
  ai/                 Orchestrator, agents, tools, workflows
  db/                 Drizzle schema (account.ts, chat.ts, agent.ts)
  auth.ts             Better-Auth config and team creation hook
  stripe.ts           Stripe client
config/
  subscriptions.ts    Plan definitions and usage limits
```

## Documentation

Full guides for customizing agents, adding tools, configuring payments, and deploying to Vercel:

**[shipaisaas.com/docs](https://shipaisaas.com/docs)**

## License

Proprietary. You are licensed to build and sell your own applications using this codebase. Reselling, redistributing, or open-sourcing the boilerplate itself is not permitted. See `LICENSE.md` for full terms.
