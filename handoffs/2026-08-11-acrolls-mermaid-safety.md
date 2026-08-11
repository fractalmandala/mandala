---
task: acrolls-mermaid-safety
status: active
host: codex
branch: main worktree
boss: svelte
updated: 2026-08-11
---

# Handoff — Acrolls Mermaid safety guard

## Where we are
Acrolls mdsvex now recovers unfenced Mermaid paragraphs into `mermaid` code nodes before the Svelte-facing output is generated. This prevents Mermaid arrows, braces, and smart-quoted labels from being interpreted as Svelte syntax. The guard is covered by three focused tests; `pnpm test`, `pnpm check`, and `pnpm build` all pass in `/Users/amrit/acrolls/packages/mdsvex`. A direct Vite build of MandalaRepo no longer reports the original `agent-configuration.md:310` Mermaid parse error.

## Decisions
- Guard only paragraphs beginning with a known Mermaid declaration; ordinary prose beginning with words such as `flowchart` remains unchanged.
- Leave already fenced Mermaid code untouched; normal Acrolls Mermaid rendering/fallback handles it.
- Do not add a broad brace/angle-bracket literal-code rewrite in mdsvex: some Svelte-like text is parsed before a remark plugin can safely distinguish documentation examples from real components.

## Remaining
- [ ] Decide whether to run a separate content-corpus cleanup for the repeated generated-doc literal examples (including `owner: object { name: string }`, `tags: Vec<String>`, `content/<Category>/`, `<svelte:head>`, and `tauri::State<T>`).
- [ ] If broad malformed-content protection is required, design a source/pre-parser normalization stage with explicit literal-code rules rather than guessing in the mdast plugin.
- [ ] Commit the Acrolls package changes and this handoff when the surrounding user work is ready to land.

## Gotchas
- MandalaRepo uses a local file dependency on Acrolls; its site-local install must be run from `/Users/amrit/mandala/sites/mandalarepo` with `pnpm install --ignore-workspace` when dependencies are absent.
- Use `./node_modules/.bin/vite build` for an isolated site build. Workspace-level pnpm commands trigger unrelated monorepo install hooks.
- The MandalaRepo site corpus is currently untracked/generated in the parent worktree; preserve unrelated user edits.

## Key files
- `/Users/amrit/acrolls/packages/mdsvex/src/remark-mermaid-guard.ts` — Mermaid recovery transform.
- `/Users/amrit/acrolls/packages/mdsvex/src/remark-mermaid-guard.test.ts` — regression tests.
- `/Users/amrit/acrolls/packages/mdsvex/src/index.ts` — plugin registration in the Acrolls mdsvex pipeline.
- `/Users/amrit/acrolls/packages/mdsvex/README.md` — package-level behavior documentation.
- `/tmp/mandalarepo-build-final.log` — latest direct Vite build output showing the Mermaid error is resolved and listing residual corpus failures.
