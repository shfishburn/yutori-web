# Agent Instructions

`CLAUDE.md` is the canonical source of truth for project AI guidance.

## Runtime policy

- Runtime governance is `diagnostic` / `advisory` only.
- Do not hard-block, rewrite, or replace model output in request-time web paths.
- Gate and verification outcomes are telemetry/QA signals unless policy explicitly changes.

## Deployment quick reference

- Supabase: `supabase db push --project-ref qxxgzstpnjytositftvm`
- Vercel preferred: `git push origin main`
- Vercel optional: `vercel deploy` or `vercel deploy --prod`
- Never push/deploy/commit unless explicitly requested in-thread
