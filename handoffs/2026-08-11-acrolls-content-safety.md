---
task: acrolls-content-safety
status: done
host: codex
branch: main worktree
boss: svelte
updated: 2026-08-11T14:49:00+05:30
---

# Handoff — Acrolls Markdown source safety

## Where we are
Acrolls now has a source-safety and corpus-preflight contract for Markdown hosts. `normalizeAcrollsMarkdown` detects a narrow set of Svelte-shaped literals in `.md` prose, wraps them as inline code before mdsvex parses the file, reports line/column findings, preserves fenced code and Mermaid blocks, and leaves `.svx` untouched. `createAcrollsMdsvexPreprocessor` wires normalization, guarantees a named `metadata` export for frontmatter-free documents, Svelte-preflights transformed `.md`/`.svx`, and supports a Markdown-only escaped `error-page` fallback. The CLI validator accepts files or directories, aggregates stable diagnostics, prints `ready`/`normalized`/`rejected` summaries, and can emit JSON reports. Product and technical contracts are recorded in `PRODUCT.md` and `TECH.md`. Full build, check, test, and example build pass; final review verdict is `ship`.

## Decisions
- Normalize only known high-risk constructs (`<svelte:...>`, component-shaped placeholders, common generic types, and object literals); broad escaping would break legitimate content.
- Keep `.svx` executable/component content unchanged; Markdown is the safe prose boundary.
- Preserve Mermaid source as a separate concern so source normalization cannot corrupt diagram syntax.
- Make strictness opt-in for existing hosts while giving CI an explicit `acrolls validate --strict` gate.
- Separate authored mode (aggregated failure) from migration mode (reported normalization plus explicit `fail` or Markdown `error-page` policy).
- Keep true runtime exclusion deferred until Acrolls owns an allowlisted generated import manifest; unrestricted globs must use fail or error-page.
- Keep diagnostics escaped and visible so migration never silently hides invalid source.

## Remaining
- [ ] Land/commit the Acrolls changes when the surrounding uncommitted product work is ready.
- [ ] Wire the new preprocessor into the next external website trial and run its full host build.
- [ ] Add a host-level invalid-document integration fixture when the import-manifest boundary is ready; current unit coverage compiles the generated fallback and proves `.svx` remains fail-fast.

## Gotchas
- Hosts should use `createAcrollsMdsvexPreprocessor()` in `svelte.config.js`; calling `mdsvex(createAcrollsMdsvexOptions())` directly retains the lower-level API but does not run source normalization before parsing.
- `.svx` is intentionally not normalized because it can contain real Svelte components; it is still Svelte-compiled and fails fast even when Markdown `error-page` mode is selected.
- `error-page` is a replacement module, not true Vite import exclusion. It is safe for unrestricted globs because the invalid route remains importable and visible.
- The CLI's `--on-invalid` flag controls validation exit/report policy; runtime hosts must set `onInvalidDocument` on the preprocessor explicitly.
- The SvelteKit adapter helper defaults to a package layout alias; external hosts should use `@acrolls/mdsvex` and provide an explicit layout when needed.
- `@acrolls/mdsvex` must be rebuilt before local `file:` hosts refresh their dependency.

## Key files
- `/Users/amrit/acrolls/packages/mdsvex/src/source-safety.ts` — normalization, findings, and protected Mermaid boundary.
- `/Users/amrit/acrolls/packages/mdsvex/src/index.ts` — public preprocessor and exports.
- `/Users/amrit/acrolls/packages/mdsvex/src/source-safety.test.ts` — source-safety regression coverage.
- `/Users/amrit/acrolls/packages/cli/src/index.ts` — file/directory validator command and policy flags.
- `/Users/amrit/acrolls/packages/cli/src/validate.ts` — corpus discovery, aggregation, summaries, and JSON report.
- `/Users/amrit/acrolls/packages/mdsvex/src/document-diagnostics.ts` — stable diagnostics and escaped fallback module.
- `/Users/amrit/acrolls/packages/cli/fixtures/corpus/` — valid, frontmatter-free, normalized, and malformed fixture corpus.
- `/Users/amrit/acrolls/packages/cli/src/integrate.ts` — generated SvelteKit wiring.
- `/Users/amrit/acrolls/docs/integrate-sveltekit.md` — host integration contract.
