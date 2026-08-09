---
task: fractalmandala-theme-fix-and-bank-layout-replication
status: done
host: command-code
branch: main (main worktree — uncommitted)
boss: svelte
updated: 2026-08-09
---

# Handoff — Theme fix & bank root page layout replication

## Where we are

Fixed the `[data-theme]` selector system across fractalmandala and replicated the `/writings` page layout to all 7 other bank root pages. `pnpm check` and `pnpm build` both pass.

## Decisions

- **Theme**: Set `data-theme` on `<html>` via `globalstores.ts` (init + toggle) and an inline `<script>` in `app.html` to prevent FOUC. Fixed `prefers-color-scheme: dark` media query which had light-theme values (copy-paste error). Added `color: var(--text-primary)` to `body,html` in `_globals.sass` to fix all text inheriting black browser default.
- **Logotype FOUC**: Replaced dynamic `src={logotypeSrc}` (Svelte store) with two static `<img>` tags toggled via CSS `[data-theme]` selectors — no more black → white flash on dark mode load.
- **Bank root pages**: All 8 pages now iterate `data.topicMap` from each bank's `CONNECTIONS.ts`, using `narrow-width` container, `text-5xl` heading, inline pill tags, border-bottom separator, and 2-column `home-step` grid — matching `/writings` exactly. Added `slug: bank.slug` to all `+page.ts` return objects for link generation.
- **Home page**: Added writings categories section below knowledge banks, loading `topicMap` from `Writings/CONNECTIONS.ts`.

## Remaining

- [ ] Verify live on `pnpm dev` — all theme transitions, all 8 bank pages visually match /writings.
- [ ] Commit and land the diff.

## Key files

- `sites/fractalmandala/src/lib/utils/globalstores.ts` — added `applyDataTheme()` + init call
- `sites/fractalmandala/src/lib/styles/_tokens.sass` — fixed `prefers-color-scheme: dark` values
- `sites/fractalmandala/src/lib/styles/_globals.sass` — added `color: var(--text-primary)` to body, logotype CSS toggle rules
- `sites/fractalmandala/src/app.html` — inline FOUC-prevention `<script>`
- `sites/fractalmandala/src/routes/+layout.svelte` — static dual logotype, removed `$themeState` debug text
- `sites/fractalmandala/src/routes/+page.ts` — loads `Writings/CONNECTIONS.ts` topicMap
- `sites/fractalmandala/src/routes/+page.svelte` — added writings categories section
- `sites/fractalmandala/src/routes/*/+page.svelte` (all 8 banks) — replicated writings layout
- `sites/fractalmandala/src/routes/*/+page.ts` (all 8 banks) — added `slug` to return

## Command Code Chat Resume Code
cmd --resume 13cbcbe1-70b0-4c53-aaa4-bf8ac44629b5