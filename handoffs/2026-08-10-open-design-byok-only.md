---
task: open-design-byok-only
status: done
host: grok-build
path: /Users/amrit/backup-fractalsvelte/open-design-main
updated: 2026-08-10
---

# Handoff — Open Design BYOK-only fork (no AMR cloud gates)

## Intent

Make the local Open Design / OpenFractal tree usable as a full design Studio (prompt → AI prototypes) with **any API key / local CLI**, without OpenFractal Cloud wallet, workspace billing, or Vela authority.

## Plan

`/Users/amrit/backup-fractalsvelte/open-design-main/plans/01-byok-only-no-amr-cloud.md`

## Operator doc

`/Users/amrit/backup-fractalsvelte/open-design-main/BYOK-ONLY.md`

## Changes (high signal)

| File | Change |
|---|---|
| `apps/web/src/features/byokOnly.ts` | **New** — `BYOK_ONLY_MODE = true`, sanitize/filter helpers |
| `apps/daemon/src/byok-only.ts` | **New** — daemon block + `OPENFRACTAL_BYOK_ONLY=0` escape |
| `apps/web/src/state/config.ts` | Load-time rewrite `agentId: amr` → BYOK API mode |
| `apps/web/src/components/EntryShell.tsx` | Skip cloud onboarding; hide AMR; default BYOK |
| `apps/web/src/App.tsx` | Filter amr from agents; refuse amr agent change |
| `apps/web/src/components/InlineModelSwitcher.tsx` | Hide OpenFractal account card |
| `apps/web/src/components/ProjectView.tsx` | No switch-to-AMR recovery |
| `apps/web/src/utils/visibleAgents.ts` + `agentOrdering.ts` | Filter/hide amr |
| `apps/daemon/src/routes/runs.ts` | 403 if run requests `amr` |

## Not changed (intentionally)

- AMR wallet gate / Vela code remains in tree (dead for UI if flag on).  
- BYOK proxy `/api/proxy/*` unchanged.  
- Design systems, skills, Studio preview unchanged.

## How to run

```bash
cd /Users/amrit/backup-fractalsvelte/open-design-main
corepack enable && pnpm install   # if needed
pnpm tools-dev run web
```

Onboarding → BYOK (or Local CLI) → paste provider key → design.

## Re-enable stock cloud

- Web: `BYOK_ONLY_MODE = false` in `apps/web/src/features/byokOnly.ts`  
- Daemon: `OPENFRACTAL_BYOK_ONLY=0` **or** set `BYOK_ONLY_MODE` false in `apps/daemon/src/byok-only.ts`

## Next (optional)

- Point OD project at mandala `vendors/design-packages/*` / `fractal-mandala` shared base.  
- Smoke test full generate → preview after `pnpm install` if not already warm.
