---
task: fix-mandalarepo-styler-optimization
status: done
host: openai/gpt-5.6-luna
branch: current worktree
boss: code
updated: 2026-08-11
---

# Handoff — Fix Mandalarepo Styler dependency optimization

## Where we are
Updated `sites/mandalarepo/vite.config.ts` to exclude `fractals-styler` from Vite dependency optimization. This prevents Vite/Rolldown from parsing the package's Svelte TypeScript source (`toc.svelte.ts`) as plain JavaScript. The dev server starts and the home page responds successfully; `pnpm check` passes with zero diagnostics.

## Decisions
- Used an app-local `optimizeDeps.exclude` workaround because `fractals-styler/lib` intentionally exports Svelte source files that must pass through the Svelte plugin.
- Did not modify the published/shared `fractals-styler` package for a consumer-specific Vite optimization issue.

## Remaining
- [ ] If a production build is required, separately fix the existing malformed HTML-like examples in imported Markdown under `docs/html/sites/fractaldharma/...`; these are unrelated to the dependency optimization error.

## Gotchas
- `pnpm build` gets past dependency optimization but fails later on malformed literal tags/braces in several Markdown documents. `pnpm check` remains green.
- The workspace is untracked in the current repository state, so ordinary `git diff` does not show the full site tree until staged.

## Key files
- `sites/mandalarepo/vite.config.ts` — dependency optimization exclusion.
- `sites/mandalarepo/package.json` — dev/check/build commands.
