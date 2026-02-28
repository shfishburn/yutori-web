# AI Operating Guide (Canonical)

This document is the canonical instruction source for AI assistants in this project.

## Runtime Policy (Non-Negotiable)

- Runtime governance is `diagnostic` and `advisory` only.
- Do not hard-block, rewrite, or replace model output in request-time web flows.
- Verification or gate outputs are telemetry/QA signals unless policy explicitly changes.

## Deploy Ops

### Supabase migrations

Use the project ref for this stack:

```bash
supabase db push --project-ref qxxgzstpnjytositftvm
```

### Vercel

Preferred deployment path:

```bash
git push origin main
```

Optional CLI path:

```bash
vercel deploy
vercel deploy --prod
```

### Safety rule

- Never push, deploy, or commit unless explicitly requested in-thread.
