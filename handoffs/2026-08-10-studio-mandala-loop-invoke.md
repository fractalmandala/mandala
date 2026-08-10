---
task: studio-mandala-loop-invoke
status: done
path: /Users/amrit/backup-fractalsvelte/open-design-main
updated: 2026-08-10
---

# Handoff — Invoke code-to-design / design-to-code from Studio

## Delivered

| Piece | Location |
| --- | --- |
| Catalog (monorepo + external) | `mandala/projects.json` (mandala + dharmalib) |
| CLI bridge | `scripts/mandala-loop.mjs` |
| Daemon API | `apps/daemon/src/routes/mandala-loop.ts` → `/api/mandala/*` |
| Docs | `mandala/LOOP.md` |
| Skill | `skills/mandala-code-design-loop/SKILL.md` |
| Allowlist env | monorepo `design-to-code/scripts/apply-intent.mjs` reads `MANDALA_ALLOWLIST` |

## Commands

```bash
node scripts/mandala-loop.mjs list
node scripts/mandala-loop.mjs scan --repo mandala
node scripts/mandala-loop.mjs code-to-design --surface fractaldharma-home --url http://127.0.0.1:5173/
node scripts/mandala-loop.mjs code-to-design --surface dharmalib-home --url http://127.0.0.1:5173/
node scripts/mandala-loop.mjs design-to-code --surface fractaldharma-home --dry-run
```

## API

`GET /api/mandala/projects|scan|status`  
`POST /api/mandala/code-to-design|design-to-code|sync`

## Add external repo

Edit `mandala/projects.json` repos + surfaces.

## Verified

- `list` shows mandala + dharmalib  
- `scan` returns 16+ workspaces under apps/sites/packages/…  
- `status` for fractaldharma-home packageReady  
- dharmalib-home package not yet extracted (expected)  
