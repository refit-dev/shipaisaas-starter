# Contributing

Thanks for taking the time. This is a starter template, so the bar for changes is a little different from a library: anything that lands here is code every user inherits.

## What we're looking for

- Bug fixes, especially in auth, billing and the AI layer.
- Dependency and framework upgrades that keep the starter current.
- Documentation and setup improvements — if something confused you, it confused someone else.
- Small, focused features that most projects would want anyway.

## What usually gets declined

- New integrations that most users would have to remove (add them to your own fork instead).
- Agentic features — tool calling, approval flows, background queues, credit metering. Those belong to the Pro edition, and the split is deliberate.
- Large refactors without a discussion first. Open an issue and let's talk about it.

## Getting set up

Follow [STARTUP.md](./STARTUP.md). You need a Postgres database and at least an AI provider key to run anything meaningful.

## Before you open a PR

```bash
npm run lint     # must be 0 errors
npm run build    # must pass
```

If you changed the schema, commit the generated migration from `npm run db:generate` alongside it — do not hand-edit files in `lib/db/migrations/`.

## Conventions

- Read [CLAUDE.md](./CLAUDE.md) — it documents the patterns this codebase expects (the `withAuth` wrapper, rate limiting before model calls, `Output.object` over `generateObject`, theme tokens instead of hardcoded colours).
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) — `fix:`, `feat:`, `docs:`, `chore:`. The commitlint hook enforces this.
- Keep PRs focused. One change, one PR.

## Reporting bugs

Open an issue with the steps to reproduce, what you expected, what happened, and your Node version. If it involves Stripe or auth, say which flow — those have the most moving parts.

## Security

Do not open a public issue for a security problem. Email the address in `config/site.ts` instead.
