# Code → Design — user guide

Extract a Svelte surface into an **Open Design–compatible design package**.

**Product:** `preprojects/code-design-loop/`  
**Skill:** `packages/fractal-agentic/skills/code-to-design/`

## What you get

```text
vendors/design-packages/<surface-id>/   # gitignored
  DESIGN.md preview/ evidence/ LOSS.md tokens.css base-ref.json meta.json
```

Open `preview/index.html` in a browser or import the folder into Open Design.

## Run

```text
Use code-to-design on sites/fractaldharma/src/routes/+page.svelte
Include layout. Prefer L3 (start pnpm/vite dev first).
```

Helpers:

```bash
# with dev server up:
node packages/fractal-agentic/skills/code-to-design/scripts/capture-l3.mjs \
  --url http://127.0.0.1:5180/ \
  --out vendors/design-packages/fractaldharma-home

node packages/fractal-agentic/skills/code-to-design/scripts/validate-package.mjs \
  vendors/design-packages/fractaldharma-home
```

## Open Design

1. Install: https://open-design.ai/ or `od` CLI  
2. Shared base: monorepo tokens / future `fractal-mandala`  
3. Open `vendors/design-packages/<surface-id>/`  
4. Redesign → later **design-to-code** (P2) for apply  

## Not this

- `svelte-style-canvas` alone (L1 forensics)  
- Writing packages into app `src/`  
