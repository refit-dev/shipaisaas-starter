# Ship AI SaaS - Developer Context

## 🏗️ Core Architecture

This is a Vertical SaaS boilerplate built on the **Orchestrator -> Agent -> Tool** paradigm using the Vercel AI SDK.

- **Orchestrator (`lib/ai/orchestrator.ts`):** Fast semantic router (`gpt-4o-mini`). It classifies the user's intent and routes it to a specific Agent.
- **Agents (`lib/ai/agents/`):** Hyper-specialized workflows (e.g., `youtube-short-creator`). They use `ToolLoopAgent` or `generateText` with `stopWhen` to autonomously loop and execute tasks.
- **Tools (`lib/ai/tools/`):** Atomic, Zod-enforced functions (e.g., `web_search`, `generate_video`).

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Auth:** Better-Auth
- **Database:** PostgreSQL + Drizzle ORM
- **AI:** Vercel AI SDK (`@ai-sdk/openai`, etc.)
- **Background Jobs:** Upstash QStash (for durable, long-running workflow execution bypassing serverless timeouts).
- **Styling:** Tailwind CSS V4 + shadcn/ui

## 💾 Database & State (Crucial Rules)

- **Chat-as-State:** Background workflow runs are saved natively as conversations. We do NOT maintain a separate complex state tree. The agent reads conversation messages to understand previous steps.
- **Memory:** We save important information in db as memories using memory-tool. This part needs to be improved and properly implemented.
- **The Asset Interceptor (`lib/ai/utils.ts`):** Do NOT rely on the LLM to save files. We intercept successful tool calls (like `generate_image` or `generate_video`) in the backend and automatically write the output to the `assets` table.

## ⚠️ strict Coding Conventions

1. **Never use `experimental_generateObject or generateObject`.** Use the stable `generateText` with `Output` from the current Vercel AI SDK.
2. **Kebab-Case Slugs:** All agent IDs and routing configurations must use kebab-case (e.g., `youtube-short`, not `youtube_short`).
3. **Zod Enforcement:** Every tool MUST have a strict Zod `parameters` schema. The Orchestrator relies on this to ask the user for missing information.
4. **No UI Hallucinations:** If updating the Chat UI to render videos or images, ensure it reads the tool output structure accurately. Do not fake streaming states for long-running video API calls; use explicit loading indicators ("Generating video (this may take 3 minutes)...").
5. **Theme-only colors in UI:** Never use hardcoded Tailwind palette classes (e.g., `text-blue-600`, `bg-rose-50`, `text-emerald-400`). All colors must come from the CSS custom properties defined in `styles/globals.css` — use only semantic tokens: `bg-background`, `bg-card`, `bg-muted`, `bg-accent`, `bg-primary`, `bg-secondary`, `bg-destructive`, `text-foreground`, `text-muted-foreground`, `text-primary`, `text-primary-foreground`, `border`, `ring`, `chart-1` through `chart-5`, and their sidebar equivalents.
