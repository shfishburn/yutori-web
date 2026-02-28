# Copilot Instructions

Use `CLAUDE.md` as the source of truth for project behavior and policy.

## Non-negotiables

- Runtime gate behavior is `advisory` / `diagnostic` only.
- Do not rewrite or hard-block model output in request-time web flow.
- Preserve telemetry fields from verification/gate outputs.

## Deploy quick reference

- `supabase db push --project-ref qxxgzstpnjytositftvm`
- Preferred Vercel path: `git push origin main`
- Optional Vercel CLI: `vercel deploy`, `vercel deploy --prod`

## Safety

- Never push, deploy, or commit without explicit user request in-thread.
