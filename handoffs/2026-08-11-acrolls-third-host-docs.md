---
task: acrolls-third-host-docs
status: active
host: codex-desktop
branch: main
boss: meta
updated: 2026-08-11T09:34:00+05:30
---

# Handoff — Acrolls third-host documentation trial

## Where we are

The Acrolls self-serve documentation is ready for a clean, independent SvelteKit host trial.
The canonical external path now installs only the four supported local packages, uses the
pure `@acrolls/docs/content` API, renders `docs/index.md` at the root without an arbitrary
redirect, and uses a nested catch-all route that excludes the empty root slug. The docs build,
example production build, direct content tests, Markdown-link check, and fresh review passed.

## Decisions

- External `file:` hosts install only `@acrolls/mdsvex`, `@acrolls/svelte`,
  `@acrolls/styles`, and `@acrolls/docs`; `@acrolls/sveltekit` remains workspace-only because
  it declares `workspace:*` dependencies.
- The pure `@acrolls/docs/content` source is the external generated-docs contract. The
  SvelteKit adapter is documented only as a workspace/example convenience API until publish.
- `/docs` renders `docs/index.md` with slug `''`; nested catch-all route entries filter that
  root slug instead of attempting a redirect to a guessed child page.
- Package refresh is explicit: build Acrolls, `pnpm install` in the host, then restart dev.

## Remaining

- [ ] Run the documented third-host trial in the target SvelteKit website and record any host-specific integration issue.
- [ ] Commit/land the Acrolls and Mandala changes after the owners of the existing dirty main worktrees choose the appropriate scoped branch.
- [ ] Mark this note `done` after the changes are merged.

## Gotchas

- Both `/Users/amrit/acrolls` and `/Users/amrit/mandala` contain substantial pre-existing
  uncommitted work. Do not reset, clean, stash, or commit unrelated changes.
- The package-level `pnpm test` wrapper currently forwards `--if-present` to Vitest and fails
  before tests run. The direct command `pnpm exec vitest run` from `packages/docs` passed 23
  tests.
- Builds emit pre-existing Svelte `<slot>` deprecation and Vite chunk-size warnings; neither
  is a documentation or generated-docs routing failure.
- Automatic generated-doc discovery is Markdown-first (`.md`). Normal mdsvex routes can still
  use `.svx`, but automatic `.svx` discovery is intentionally deferred.

## Verification

- `pnpm check` — passed (one pre-existing `<slot>` deprecation warning in `@acrolls/svelte`).
- `pnpm exec vitest run` from `packages/docs` — 23 tests passed.
- `pnpm build` — all packages passed.
- `pnpm build:example` — passed.
- Local Markdown link check across root/docs/package READMEs — passed for 20 files.
- `git diff --check` — passed.
- Fresh documentation review — `ship`.

## Key files

- `/Users/amrit/acrolls/docs/README.md` — third-host trial entry point.
- `/Users/amrit/acrolls/docs/getting-started.md` — canonical generated-docs integration tutorial.
- `/Users/amrit/acrolls/docs/snippets/docs-source.ts` — external source configuration.
- `/Users/amrit/acrolls/docs/snippets/docs-generated-layout.svelte` — generated-docs shell layout.
- `/Users/amrit/acrolls/docs/snippets/docs-root-page.svelte` — root docs page.
- `/Users/amrit/acrolls/docs/snippets/page-load.ts` — nested catch-all load/entries contract.
- `/Users/amrit/acrolls/docs/snippets/document-page.svelte` — lazy article renderer.
- `/Users/amrit/acrolls/docs/checklist.md` and `troubleshooting.md` — trial and recovery steps.
- `/Users/amrit/acrolls/packages/{docs,mdsvex,svelte,sveltekit}/README.md` — package-level install contract.
