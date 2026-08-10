---
name: code-to-design
description: >
  Extract a Svelte/SvelteKit surface into an Open Design–compatible design package
  (shared-base ref + per-surface overlay, gitignored under vendors/design-packages/).
  Use for code→design in the bidirectional code-design-loop: capture live UI (L3 when
  possible), emit DESIGN.md, tokens.css, preview/, evidence/contract.json, LOSS.md.
  Triggers: "code to design", "extract design package", "open design package of X",
  "/code-to-design", or when starting the approved code↔design loop extract step.
---

# Code → Design

Produce an **Open Design–compatible design package** from mandala product source.

**Product / tech:** monorepo `preprojects/code-design-loop/PRODUCT.md` + `TECH.md`  
**Not this:** full design studio (use Open Design). Not design→code (use `design-to-code` when present).  
**Not sufficient alone:** `svelte-style-canvas` L1 — that is evidence-only; do not claim extract success with only a region tree.

## Hard gates (fail the run if violated)

1. Package under **`vendors/design-packages/<surface-id>/`** (gitignored). Never write into app `src/` as package home.  
2. Non-empty **`preview/index.html`** that looks like the UI (not dashed label boxes).  
3. **`meta.fidelity`** honest: `L3` only if live browser capture was used; `L2` compiled/static real CSS; `L1` agent mock only with LOSS.  
4. **Shared base + per-surface:** surface `DESIGN.md` is an overlay; `base-ref.json` points at shared base (`fractal-mandala` or `inline-from-monorepo`).  
5. Header badge style claims: do not tell the user this is Open Design parity at L1.

## Package layout (required files)

```text
vendors/design-packages/<surface-id>/
  DESIGN.md
  tokens.css
  base-ref.json
  preview/index.html
  evidence/contract.json    # version: 2
  evidence/report.md
  LOSS.md
  meta.json
```

Optional: `evidence/screenshot.png`

Schema: `preprojects/code-design-loop/schema/contract.v2.json`

## Pipeline

### 1 — Scope

- Resolve target `.svelte` + layout chain (default: page + direct layouts).  
- Assign stable **surface id** (kebab-case), e.g. `fractaldharma-home`.

### 2 — Inventory

- Regions, classes, `class:` states (compose `layout-capture` / `styling-docs-builder` / optional `svelte-style-canvas` evidence only).  
- Map each region → file:line → `sourceMap` + `regions[]`.

### 3 — Tokens

- Read workspace token sheets (e.g. `src/lib/styles/_tokens.sass`).  
- Emit `tokens.css` usable by the preview (theme blocks `.dark` / `.light` as needed).

### 4 — Fidelity path

| Level | When | How |
| --- | --- | --- |
| **L3** (preferred) | `pnpm dev` (or URL) available | Playwright or Chrome headless: navigate → screenshot → freeze `.app-shell` (or body) + inlined styles into `preview/index.html` |
| **L2** | No browser, SASS/CSS available | Compiled/static HTML shell with real classes + resolved CSS |
| **L1** | Last resort | Markup-faithful `visualHtml` + `cssSubset`; mark LOSS heavily |

Helper script (optional): `packages/fractal-agentic/skills/code-to-design/scripts/capture-l3.mjs`

### 5 — DESIGN.md (surface overlay)

Write a short OD/Stitch-compatible overlay:

- Extends shared base (name in `base-ref.json`)  
- Surface role, layout chrome, key components, theme default  
- Do **not** restate entire brand if base already owns tokens  

### 6 — Write package + validate

- Write all required files.  
- `contract.json` **version: 2**, `meta.previewEntry`: `preview/index.html`.  
- Validate required fields exist (node one-liner or schema).  
- Write `LOSS.md` for paneforge, animated icons, data panes, etc.

### 7 — Open Design handoff (print for user)

```text
1. Install Open Design if needed: https://open-design.ai/ or od CLI
2. Shared base: use monorepo tokens / future fractal-mandala design system
3. Open surface package folder:
   vendors/design-packages/<surface-id>/
4. Preview: open preview/index.html in OD project or browser
5. When redesign is approved → run design-to-code (P2) — do not hand-edit app src blindly
```

## Verification before claiming done

1. Re-read target; major regions in contract + visible in preview.  
2. `preview/index.html` opens and shows real chrome (screenshot if possible).  
3. `meta.fidelity` matches method used.  
4. Package path under `vendors/design-packages/`.  
5. User sees OD handoff steps.

## Output to user

1. Surface id + fidelity  
2. Package path  
3. OD open steps  
4. Loss highlights  
5. Paths to DESIGN.md, preview, contract, LOSS

## Discipline

- Prefer live capture over invention.  
- Indented SASS monorepo: external styles are source of truth.  
- Design boss for visual quality; do not apply back to code in this skill.  
- Dirty shradhapp WIP: use a clean worktree for skill commits when possible.
