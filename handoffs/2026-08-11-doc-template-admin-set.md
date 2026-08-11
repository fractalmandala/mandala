---
task: doc-template-admin-set
status: done
host: codex
branch: main worktree
boss: svelte
updated: 2026-08-11
---

# Handoff — Documentation template admin set

## Where we are

The approved prototype has been converted into six portable Svelte 5 templates under `admin/templates/docs`: a home template and document template for each of fractalmandala, fractalagentic, and fractaldesign. Styling is split into CUBE-oriented composition, utility, token, and site block SASS files with light and dark theme tokens. The live site routes were not wired or changed during this conversion. A narrow `.gitignore` exception exposes only this template folder because the repository otherwise ignores `admin/`.

## Decisions

- Kept each site as two standalone Svelte components so the templates can be reviewed and wired independently.
- Used Svelte 5 `$props()` with configurable theme, brand, content, navigation, and optional Design logo props.
- Used CUBE-style class layers: `l-*` compositions, `u-*` utilities, and site blocks without BEM selectors.
- Kept all styles in pure indented `.sass` files and imported them from `styles/index.sass`.
- Added light/dark theme variables centrally in `_tokens.sass` and site accents for Mandala, Agentic, and Design.
- Added only a targeted ignore exception for `admin/templates/docs/**`; the rest of `admin/` remains ignored.

## Remaining

- [ ] When implementation is approved, wire the templates into the corresponding SvelteKit sites and map real content/data.
- [ ] Pass each site’s final logo path to `DesignHomeTemplate` and `DesignDocumentTemplate`.
- [ ] Add site-specific route metadata, TOC data, and action handlers during integration.

## Gotchas

- The root has no runnable package; `pnpm exec` from `/Users/amrit/mandala` attempts the workspace prepare flow. Final Sass verification used the existing Sass binary under `sites/fractaldesign/node_modules/.pnpm/`.
- `admin/` is ignored by default. The `.gitignore` rules now expose only `admin/templates/docs/` and its contents.
- The repository was already heavily dirty before this task. Preserve unrelated changes when wiring these templates later.

## Key files

- `admin/templates/docs/README.md` — template usage, props, themes, and CUBE layering.
- `admin/templates/docs/fractalmandala/` — Mandala home and document templates.
- `admin/templates/docs/fractalagentic/` — Agentic home and document templates.
- `admin/templates/docs/fractaldesign/` — Design home and document templates.
- `admin/templates/docs/styles/index.sass` — shared SASS entrypoint.
- `admin/templates/docs/styles/_tokens.sass` — light/dark and site theme tokens.
- `.gitignore` — narrow tracking exception for the template set.
