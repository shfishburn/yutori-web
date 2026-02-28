---
description: Keep runtime gate behavior diagnostic-only
applyTo: "apps/**/src/**/*.ts,apps/**/src/**/*.tsx,src/**/*.ts,src/**/*.tsx"
---

- Keep runtime gating advisory diagnostics only.
- Do not perform response rewrite or hard-block from gate outcomes in request-time flow.
- Preserve telemetry fields in gate/verification output payloads.
