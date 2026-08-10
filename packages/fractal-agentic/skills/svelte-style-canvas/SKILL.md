---
name: svelte-style-canvas
description: >
  Inspect a Svelte/SvelteKit component or page, resolve which external SASS/CSS
  styles and design tokens actually apply, and generate a self-contained interactive
  HTML canvas preview that approximates the visual layout (regions, colors, spacing,
  type, state variants). Use whenever the user asks to preview styling, open a style
  canvas, generate a component/page mock from source, understand what styles are
  working on a Svelte file, build an interactive style prototype, or says things like
  "style preview of X", "canvas prototype of this component", "what styles hit this
  page?", "style playground", or "/svelte-style-canvas". Prefer this over layout-capture
  or flow-mapper alone when the goal is visual/style fidelity, not architecture edges.
---

# Svelte Style Canvas

Produce an **evidence-based, style-aware interactive HTML prototype** of a Svelte
component or page. This is not a full Svelte runtime and not an architecture node map.

**Composes** (read when needed — do not re-implement their full workflows):

| Skill | Use for |
| --- | --- |
| [styling-docs-builder](../styling-docs-builder/SKILL.md) | Class → SASS definition, tokens, orphan classes |
| [layout-capture](../layout-capture/SKILL.md) | DOM / region hierarchy semantics |
| [fa-flow-mapper](../fa-flow-wrapper/SKILL.md) | Canvas interaction patterns, evidence discipline |

Load progressive references from this skill only when needed:

- [references/style-pack-schema.md](references/style-pack-schema.md) — machine-readable style pack
- [references/related-skills.md](references/related-skills.md) — when to hand off vs compose
- [assets/preview-template.html](assets/preview-template.html) — offline preview shell

## Objective

Given a target `.svelte` file (and optional layout chain):

1. Build a **region tree** from the markup (containers that matter for layout).
2. Collect classes, `class:` states, and structural conditions (`{#if}`, `{#each}`).
3. Resolve each class to SASS/CSS definitions and token dependencies.
4. Emit a **style pack** JSON (`style-pack.json`).
5. Emit a self-contained **preview.html** that renders styled regions, state toggles,
   and an inspector with file:line evidence.
6. Emit a short **report.md** with unresolved styles and confidence notes.

Do **not** invent rules that are not in the source. Do **not** claim pixel-perfect
browser fidelity at L1 (default). Mark confidence: `observed` | `inferred` | `unresolved`.

## When not to use

| Need | Prefer |
| --- | --- |
| Architecture edges / data flow canvas | `fa-flow-mapper` / monorepo `flow-mapper` |
| Mermaid-only layout diagrams | `layout-capture` |
| Living design-system markdown only | `styling-docs-builder` |
| Redesign / polish the real UI | Design boss + `impeccable` / `better-ui` |

## Scope discovery

1. Resolve the **target** path the user named (component, `+page.svelte`, layout).
2. Optional **chain**: parent `+layout.svelte` files when the user asks for a page shell,
   or when the page is empty without layout chrome.
3. Locate styles for the workspace:
   - Prefer `src/lib/styles/**/*.sass` (indented SASS, monorepo default)
   - Also scan co-located `*.sass` / `*.css` and in-file `<style>` if present
4. Cap depth: default **one component + direct layout parents**. Expand child components
   only one level deep unless the user asks for a full page tree.

If the path is ambiguous, ask once for the exact file. Do not full-scan the monorepo.

## Pipeline

### Phase 1 — Structure inventory

Read the target Svelte file fully (not Grep-only). Extract:

- Outer semantic regions (shell, header, sidebar, main, footer, panels, lists, empty states)
- Element / component tag, `class` tokens, `class:foo` state names
- Conditions that change layout (`{#if}`, `{:else}`, `{#each}`)
- Child components (name + import path) — treat as leaf regions unless expanded

Assign each region: `id`, `label`, `kind`, `file`, `lineRange`, `classes[]`,
`states[]`, `parentId`, `confidence`.

### Phase 2 — Style resolve

For every class token used:

1. Search stylesheets for `.class-name` (and nested indented forms under parents).
2. Record definition file + line, raw property block (best-effort; convert indented
   SASS property lines to CSS when emitting the pack).
3. Collect referenced CSS custom properties (`var(--*)`) and SASS vars (`$…`).
4. Resolve token **definitions** from token/theme sheets when present.
5. Flag **orphan classes** (used in markup, not found in styles) as `unresolved`.

Do not expand every mixin project-wide. If a rule is mixin-only and unresolvable without
a compiler, mark `inferred` or `unresolved` and explain in the report.

### Phase 3 — Style pack

Write `style-pack.json` matching [references/style-pack-schema.md](references/style-pack-schema.md).

Include:

- `meta` (target, date, fidelity level, repo paths)
- `tokens` used by this target
- `classes` registry with evidence
- `regions` tree with applied classes + states
- `states` catalog for the preview toggle bar
- `cssSubset` — string of CSS safe to inject (only observed selectors + `:root` tokens used)
- `orphans` / `unresolved`

**Fidelity levels**

| Level | Meaning |
| --- | --- |
| `L1` (default) | Agent-resolved SASS/CSS subset |
| `L2` | Optional future: sass compile / PostCSS extract of used selectors |
| `L3` | Optional future: Playwright `getComputedStyle` snapshot |

Always set `"fidelity": "L1"` unless you actually used a higher method.

### Phase 4 — Interactive preview

1. Read [assets/preview-template.html](assets/preview-template.html).
2. Replace `/*__SSC_INJECTED_CSS__*/` with `cssSubset` (and any chrome-safe defaults).
3. Replace the JSON inside `<script type="application/json" id="ssc-style-pack">…</script>`
   with the style pack (valid JSON, escaped as needed for embedding).
4. Set document title / header from `meta.title`.
5. Write `preview.html`.

The preview must:

- Render nested **regions as real boxes** using injected CSS classes (not only abstract nodes)
- Provide a **state toggle** bar for discovered `class:` / structural states
- Provide an **inspector** for selected region: classes, tokens, file:line
- Work **offline** with no CDN deps
- Support basic pan of the stage (or scroll) and a **reset** control
- Never invent styled regions that lack structure evidence

### Phase 5 — Report

Write `report.md`:

1. Scope and assumptions
2. Region tree (brief)
3. Class registry table (class → defined in → tokens)
4. Orphan / unresolved list
5. Paths to artifacts
6. Verification notes
7. Confidence summary

## Deliverable location

Save under the monorepo root (create if missing):

```text
vendors/style-previews/<target-slug>/
  style-pack.json
  preview.html
  report.md
```

Slug: kebab-case from component/page name (e.g. `shradhapp-project-sidebar`).

**Never** write these artifacts into the target app’s `src/`.

If the user is outside a monorepo with `vendors/`, use `./style-previews/<slug>/`
relative to the project root and say so in the report.

## Verification (required before claiming done)

1. Re-read the target Svelte file; every major region has evidence.
2. Every class in the pack is either resolved or listed as orphan.
3. Open `preview.html` in a browser tool if available; otherwise state manual steps:
   open file → toggle states → click two regions → inspector updates.
4. Confirm no console-breaking JSON parse errors (valid pack embed).
5. Confirm artifacts live under the deliverable path, not app source.

## Output to the user

Return:

1. One-paragraph summary of what was previewed
2. Paths to `preview.html`, `style-pack.json`, `report.md`
3. Orphan/unresolved highlights
4. Fidelity level and limitations (L1 is approximate)

## Agent discipline

- Prefer Read over Grep for nesting-aware SASS.
- Keep the style pack honest: `unresolved` is better than fake CSS.
- Do not redesign colors or invent a theme when tokens are missing — show structure
  with neutral fallbacks and flag missing tokens.
- Mandala monorepo: indented SASS, often **zero** in-component `<style>` — external
  sheets are the source of truth.
- This skill is **stack-aware content** packaged under Meta portfolio process; do not
  convert product UI in the app as part of the skill unless the user asked to change
  the component itself.
