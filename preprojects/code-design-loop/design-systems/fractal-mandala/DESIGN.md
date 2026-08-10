# Fractal Mandala — shared design base

**id:** `fractal-mandala`  
**version:** 0.1.0  
**role:** Shared Open Design brand base for the mandala monorepo  

## Layering

| Layer | Responsibility |
| --- | --- |
| **This package** | Portable brand/token export for Open Design + agents |
| **Per-surface packages** | `vendors/design-packages/<surface-id>/` overlays, freezes, loss, apply intents |
| **Monorepo SASS** | Product source of truth (`_*tokens*.sass` per app) |

Surfaces **extend** this base via `base-ref.json` — they must not redefine the full brand.

## Apps represented

- **fractaldharma** — `sites/fractaldharma/src/lib/styles/_tokens.sass` (59 tokens)
- **fractalengine** — `apps/fractalengine/src/lib/styles/_tokens.sass` (102 tokens)

## Usage in Open Design

1. Load this design system as the project brand (DESIGN.md + tokens.css).  
2. Open a surface package under `vendors/design-packages/<id>/` for page-specific preview.  
3. Apply back only via `design-to-code` with surface allowlists — promote shared tokens only with explicit flag.

## Regenerating

```bash
node packages/fractal-agentic/skills/code-to-design/scripts/export-shared-base.mjs
```

Generated: 2026-08-10T13:28:02.493Z
