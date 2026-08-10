---
task: embed-mandala-knowledge
status: done
host: open-design-main fork
path: /Users/amrit/backup-fractalsvelte/open-design-main
updated: 2026-08-10
---

# Handoff — Embed mandala knowledge into design Studio

## What landed

| Item | Location |
| --- | --- |
| Design system **fractal-mandala** | `design-systems/fractal-mandala/` (enriched DESIGN.md + tokens) |
| Default `designSystemId` | `fractal-mandala` when `PRODUCT_FORK_MODE` |
| Skills | `skills/mandala-svelte`, `skills/mandala-code-design-loop` |
| Surfaces catalog | `mandala/surfaces.json` |
| Package snapshots | `mandala/design-packages/{fractaldharma-home,fractalengine-appdock}` |
| Sync script | `scripts/sync-mandala-knowledge.mjs` |
| Docs | `mandala/README.md`, `PRODUCT-FORK.md` (updated) |

## How to use

1. Restart Studio (`fnm use 24` + `pnpm tools-dev run web`).  
2. Clear `openfractal:config` if an old design system id is stuck.  
3. New project should default to **Fractal Mandala**.  
4. Select skill **mandala-svelte** or **mandala-code-design-loop**.  
5. After monorepo extracts: `node scripts/sync-mandala-knowledge.mjs`.

## Next

- UI surface picker from `surfaces.json`  
- One-click “open package preview”  
- Invoke monorepo code-to-design / design-to-code from Studio actions  
