# Acrolls CLI readiness audit — 2026-08-11

## Scope

Audited `/Users/amrit/acrolls` for the next internal SvelteKit deployment trial. The operator is
responsible for bringing a clean Markdown corpus; this audit covers the CLI, onboarding contract,
guides, package gates, and the example host's HTTP surface.

## Changes made

- Corrected the onboarding preprocessor snippet so it shows both scopes explicitly:
  - SvelteKit `extensions: ['.svelte', '.md', '.svx']`.
  - Acrolls preprocessor `extensions: ['.md', '.svx']`.
- Corrected the stale CLI guide sentence that denied global `--cwd` support.
- Made `onboard --check` inspect required wiring markers instead of treating every existing file as
  complete. It now checks generated-source globs/metadata, docs shell/nav/styles, lazy document
  loading/Publication or configured PublicationLayout, and root/catch-all/404 route markers.
- Documented the intentional Svelte 5 `<slot />` warning in `PublicationLayout`.

## Verification

- `pnpm install --frozen-lockfile` — pass.
- `pnpm build` — pass.
- `pnpm check` — pass; one intentional `<slot />` deprecation warning.
- `pnpm test` — pass: 58 tests across mdsvex, docs, and CLI.
- `pnpm --filter @acrolls/example-kit check` — pass.
- `pnpm build:example` — pass; expected table-wrapper a11y warning, `<slot />` warning, Vite
  chunk/externalization warnings.
- CLI `--help`, `--version`, status, onboarding JSON/check, validate, integrate dry-run, init
  dry-run, and the published wrapper's local execution — pass.
- `validate examples/starter/article.md` — `1 discovered · 1 ready · 0 normalized · 0 rejected`.
- `validate examples/kit-consumer/src/content/acceptance.svx --mode authored --on-invalid fail` —
  `1 discovered · 1 ready · 0 normalized · 0 rejected`.
- Studio served a local preview and `/api/preview`; both returned valid output.
- Example host HTTP smoke test passed: `/acceptance` 200 with code frame, table wrapper, callout,
  and figure; `/docs` and nested `/docs/guides/installation` 200; unknown `/docs/missing` 404.

## Trial gate

**Ship for internal trial**, provided the host corpus passes `acrolls validate` and the host's own
`pnpm check`/`pnpm build`. Remaining warnings are documented and non-fatal; they are not Markdown
syntax failures. Do not infer deployment success from onboarding output alone—verify the host's
actual routes and deployment URL.

## Follow-up — interactive checkpoint numbering

The interactive onboarding loop previously skipped completed checkpoints while retaining their
original numbers, making the terminal appear to jump from (for example) Step 3 to Step 5. It now
prints completed checkpoints as concise `[done]` progress lines before continuing. CLI tests pass
(9 tests), and a pseudo-terminal smoke check against `packages/fractalsvelte` showed Steps 1–5 in
order before pausing at the first pending checkpoint.

## Follow-up — duplicate root breadcrumb

The root host route rendered `Home / Fractalsvelte / Docs / Docs` because the local file dependency
was using an older copied `@acrolls/docs/dist/nav.js`, even though the Acrolls source already had
the adjacent-label deduplication fix. The host dependency was refreshed and now resolves the
updated `appendCrumb` implementation. Direct verification of the host-linked package returns
`Home / Fractalsvelte / Docs` for `/docs`.

The Acrolls docs package test suite passes all 27 tests (19 content-source tests and 8 navigation
tests). The host `packages/fractalsvelte` check also passes with 0 errors and 0 warnings. The stale
unused `mdsvex` import was removed from the host config; Acrolls' preprocessor remains the only
Markdown preprocessor.
