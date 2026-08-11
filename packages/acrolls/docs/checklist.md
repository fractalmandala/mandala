# Self-serve integration checklist

Print or keep open while wiring a host.

Recommended first: use the CLI-led drop-in. From the existing host root, run
`acrolls onboard --docs-dir docs --base-href /docs` for exact file paths, snippets, cautions,
and deployment checks. Use `acrolls onboard --check` to rescan completed checkpoints or `--json`
when another UI/agent will render the flow.

## Acrolls monorepo

- [ ] Clone/path known: `______________________________`
- [ ] `pnpm install && pnpm build` succeeds
- [ ] `packages/mdsvex/dist/index.js`, `packages/svelte/dist/index.js`, and `packages/docs/dist/index.js` exist

## Host app

- [ ] SvelteKit 2 + Svelte 5
- [ ] `pnpm add file:…/mdsvex file:…/svelte file:…/styles file:…/docs`
- [ ] `pnpm add -D mdsvex`
- [ ] **Not** adding `@acrolls/sveltekit` via file: for now
- [ ] Host `pnpm install` finishes after package add

## Config

- [ ] `svelte.config.js` → `createAcrollsMdsvexPreprocessor({…})` in `preprocess`
- [ ] `extensions` includes `.svelte`, `.md`, `.svx`
- [ ] Optional `*.md` / `*.svx` module declarations in `app.d.ts`

## Article path

- [ ] At least one `.md` route content file
- [ ] Page wraps with `<Publication>`
- [ ] Imports `default.css` **or** `foundation.css` (once)

## Docs path (optional)

- [ ] Choose a filesystem content root (`docs/`, `content/`, `posts/`, etc.)
- [ ] Configure the public `baseHref` (`/docs`, `/content`, `/posts`, etc.) independently
- [ ] Generated source combines lazy component and eager metadata globs
- [ ] `DocsShell` receives generated `docs.nav` (or a deliberately manual `DocsNav`)
- [ ] `docs/index.md` has a root `src/routes/docs/+page` that renders slug `''`, or the host intentionally provides its own overview
- [ ] Use a `[...slug]` catch-all route when nested folders are allowed
- [ ] Catch-all `entries()` excludes the empty root slug
- [ ] `docs/+layout.svelte` uses `DocsShell` + `@acrolls/docs/styles.css`
- [ ] Article pages still use `Publication`
- [ ] Index disables TOC/pager if desired

## Verify

- [ ] `pnpm dev` — article renders
- [ ] `pnpm build` — host production build succeeds
- [ ] Code fence shows copy after click
- [ ] Docs root and one nested document both return 200
- [ ] Docs: sidebar sections collapse/expand and **persist** after reload
- [ ] Docs: nested child highlights and opens ancestors
- [ ] Docs: group landing links and any badges display as configured
- [ ] Docs: TOC lists h2/h3 and tracks scroll
- [ ] Browser console has no runtime errors during docs navigation
- [ ] CLI: `validate` exits 0 on a real page

## If blocked

- [ ] Minimal repro route only
- [ ] Read [troubleshooting.md](./troubleshooting.md)
- [ ] Compare `examples/kit-consumer` in the Acrolls repo
- [ ] After an Acrolls package update: rebuild Acrolls → `pnpm install` in host → restart `pnpm dev`
