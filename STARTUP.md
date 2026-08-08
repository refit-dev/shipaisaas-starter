# Setup Guide

Everything you need to get from a fresh clone to a running app, including where each API key comes from. Budget about fifteen minutes.

---

## 1. Install

```bash
git clone https://github.com/jeanchrinot/shipaisaas-starter.git my-app
cd my-app
npm install
cp .env.example .env
```

---

## 2. Database

Any Postgres instance works. Two easy options:

**Supabase** — create a project, then Project Settings → Database → Connection string → URI. Use the connection pooler URI for serverless deployments.

**Neon** — create a project and copy the connection string from the dashboard.

```bash
DATABASE_URL=postgres://user:password@host:5432/dbname
```

Then create the schema:

```bash
npm run db:migrate
```

`npm run db:studio` opens a browser UI over your tables if you want to look around.

---

## 3. Authentication

Generate a secret:

```bash
openssl rand -base64 32
```

```bash
BETTER_AUTH_SECRET=<the value you just generated>
BETTER_AUTH_URL=http://localhost:3000
```

### Google sign-in

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth 2.0 Client ID of type **Web application**.
3. Authorised redirect URI: `http://localhost:3000/api/auth/callback/google` (add your production URL later).
4. Copy the client ID and secret:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Email/password sign-in works without this — Google is optional but the button is already wired up.

---

## 4. Email (Resend)

Sign-up verification codes and password resets go through [Resend](https://resend.com).

1. Create an API key.
2. Verify a sending domain (or use Resend's test address while developing).

```bash
RESEND_API_KEY=re_...
EMAIL_FROM="My SaaS App <noreply@yourdomain.com>"
```

---

## 5. AI provider

At least one is required:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=          # optional, enables the Claude models
```

The available models live in `lib/ai/models.ts`. Remove the entries you have no key for, or add another provider supported by the Vercel AI SDK.

---

## 6. Payments (Stripe)

1. In the Stripe dashboard, create two products — **Pro** and **Business** — each with a monthly and a yearly price.
2. Copy the four price IDs (they start with `price_`).
3. Copy your secret key from Developers → API keys.

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID=price_...
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID=price_...
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID=price_...
```

### Webhooks in development

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a signing secret:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Without this, checkout will succeed but your database will never learn about it.

---

## 7. File storage (optional)

Chat attachments and profile pictures are stored in Supabase Storage. Skip this if you need neither.

```bash
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

In the Supabase dashboard, create two **public** buckets:

| Bucket    | Holds                                              |
| --------- | -------------------------------------------------- |
| `uploads` | Chat attachments — images and PDFs, up to 10 MB     |
| `avatars` | Profile pictures uploaded from Settings             |

Both must be public: the app stores the URL returned by `getPublicUrl()` on the message or user record. If you need private files, switch `lib/supabase/storage.ts` to signed URLs and store the object path instead.

---

## 8. Run it

```bash
npm run dev
```

Sign up at [http://localhost:3000/signup](http://localhost:3000/signup). You will get a six-digit verification code by email, then land in onboarding, and a workspace is created for you.

---

## 9. Make it yours

| To change…              | Edit…                                       |
| ----------------------- | ------------------------------------------- |
| Assistant personality   | `config/ai.ts`                              |
| Task templates          | `config/tasks.ts`                           |
| Plans, prices, limits   | `config/subscriptions.ts`                   |
| Site name, footer, nav  | `config/site.ts`, `config/marketing.ts`     |
| Dashboard sidebar       | `config/dashboard.ts`                       |
| Colours and theme       | `styles/globals.css`                        |
| Landing page sections   | `app/(marketing)/page.tsx`                  |
| Blog and help articles  | `content/blog/`, `content/help/`            |

### Adding a database table

1. Add the table to `lib/db/schema/` (follow the patterns in `account.ts` and `chat.ts`).
2. `npm run db:generate` to create the migration.
3. `npm run db:migrate` to apply it.

---

## 10. Deploy

Push to GitHub and import the repo in Vercel. Set every variable from your `.env`, with `NEXT_PUBLIC_APP_URL`, `BASE_URL` and `BETTER_AUTH_URL` pointing at your production domain.

Then, in Stripe, add a webhook endpoint at `https://yourdomain.com/api/webhooks/stripe` subscribed to `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`, and put its signing secret in `STRIPE_WEBHOOK_SECRET`.

Add your production callback URL to the Google OAuth client while you are there.

---

## Troubleshooting

**Sign-up succeeds but no email arrives.** Check `RESEND_API_KEY` and that `EMAIL_FROM` uses a domain verified in Resend.

**Checkout completes but the plan never changes.** The webhook is not reaching you. In development, `stripe listen` must be running and its signing secret must be in `.env`.

**`DATABASE_URL is missing` from drizzle-kit.** The Drizzle CLI reads `.env` directly — make sure the variable is there, not only in your shell.

**Rate limited immediately.** The free plan allows 10 requests a day. Raise the numbers in `config/subscriptions.ts` while developing.
