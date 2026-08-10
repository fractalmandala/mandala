---
task: acrolls-mandalarepo-docs
status: active
host: codex
branch: main
boss: svelte
updated: 2026-08-11
---

# Handoff — Acrolls Markdown integration for mandalarepo

## Where we are

Acrolls mdsvex wiring is installed in `sites/mandalarepo`. The site now exposes the
repository-level `docs/` directory through a `$docs` SvelteKit alias and uses Vite
Markdown globs for the proof page and catch-all route. `pnpm check` passes with zero
errors and warnings. `pnpm build` reaches the full Markdown corpus but fails on 336
legacy documents containing raw Mermaid, angle-bracket placeholders, or HTML-like text
that Svelte interprets as markup.

## Decisions

- Keep the source content in `sites/mandalarepo/docs/` rather than moving the corpus.
- Put mdsvex configuration in `svelte.config.js`; keep `vite.config.ts` limited to Vite plugins.
- Use `import.meta.glob('/docs/**/*.md')` so TypeScript does not resolve hundreds of external Markdown modules individually.
- Keep the `$docs` alias available for future static document imports.

## Remaining

- [ ] Decide whether to curate a build-safe docs subset or normalize/sanitize the legacy Markdown corpus.
- [ ] Add `DocsShell` navigation after the content set and URL policy are settled.
- [ ] Re-run `pnpm build` after the corpus policy is implemented.

## Gotchas

- `pnpm check` does not compile every Markdown module imported by a lazy Vite glob; production build does.
- The current catch-all route maps `docs/<path>.md` to `/docs/<path>`.
- `.html` files under `docs/` are not included by the Markdown glob.

## Key files

- `sites/mandalarepo/svelte.config.js` — Acrolls mdsvex and `$docs` alias.
- `sites/mandalarepo/src/routes/docs/+page.ts` — proof document loader.
- `sites/mandalarepo/src/routes/docs/+page.svelte` — proof article rendering.
- `sites/mandalarepo/src/routes/docs/[...slug]/+page.ts` — Markdown catch-all loader.
- `sites/mandalarepo/src/routes/docs/[...slug]/+page.svelte` — catch-all article rendering.
- `sites/mandalarepo/src/app.d.ts` — `.md` and `.svx` module declarations.
