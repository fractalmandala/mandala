---
id: perf-asset-load-splitting
title: Asset Load and Code Splitting Performance
type: archive
tags: [performance, history]
updated: 2026-07-15
---

> **Historical performance research — kept as reference.**

# Asset Load Code Splitting

## Investigation scope

This pass examined the SvelteKit production client manifest and the largest emitted JavaScript chunks after the workspace layouts had already been made dynamic. It focused on dependency boundaries for Notes rich editing and AI Mermaid rendering. Styling, native IPC, and runtime model loading were out of scope.

## Methodology

- Ran `pnpm build` and sorted `.svelte-kit/output/client/_app/immutable/chunks/*.js` by emitted size.
- Mapped oversized files back through `.svelte-kit/output/client/.vite/manifest.json`.
- Traced their importers to `NotesEditor.svelte` and `ai-elements/Mermaid.svelte`.
- Rebuilt after each candidate change and retained only the change that altered the bundle graph without broad execution-order risk.
- Ran Svelte diagnostics and the product Playwright suite after implementation.

## Measured result

| Metric | Before | After | Change |
|---|---:|---:|---:|
| Largest Lowlight deferred chunk | 839.33 kB / 218.46 kB gzip | not emitted | -839.33 kB when rich Notes loads |
| Largest remaining client chunk | 839.33 kB | 593.66 kB | -245.67 kB (-29.3%) |
| Highlight grammars registered | 12 modules / 13 names including the HTML alias | unchanged | no feature loss |
| Build chunks above 500 kB | 2 | 1 | one accidental oversized entry removed |

Sizes are minified production output reported by Vite 8.0.16. They are bundle measurements, not inferred wall-clock timings.

## Primary driver

`NotesEditor.svelte` used `import('lowlight')` inside the lazy TipTap loader and destructured only `createLowlight`. Because the package root became a dynamic entry, its static `all` re-export remained reachable and Rolldown emitted every bundled Highlight.js grammar. This contradicted the component's existing intent to import only the explicitly supported languages.

The fix makes `createLowlight` a static named import. Tree shaking now retains the lightweight factory and Highlight.js core, while the 12 explicit grammar modules remain dynamic alongside TipTap. Rich editor construction and the registered language set are unchanged.

## Remaining large chunk

The 593.66 kB chunk maps to Mermaid's generated parser dependencies. Mermaid itself is already behind `import('mermaid')` in `ai-elements/Mermaid.svelte`, so this file is fetched only when an AI response contains a Mermaid fence. Rolldown `codeSplitting.maxSize` cannot subdivide a single generated module. A trial manual vendor group did not change the chunk and was removed; the build warning threshold was deliberately not raised.

## Recommendations

1. Keep package-barrel dynamic imports out of feature loaders when only one tree-shakeable export is required.
2. Preserve the existing Mermaid lazy boundary. Revisit its size only if the product can accept a smaller diagram engine or a server/native renderer.
3. Add a manifest regression check that fails when a new client chunk exceeds an agreed threshold, with a documented exception for the on-demand Mermaid parser.

## Files read

- `src/lib/components/NotesEditor.svelte`
- `src/lib/components/ai-elements/Mermaid.svelte`
- `src/lib/components/ai-elements/Code.svelte`
- `src/routes/+page.svelte`
- `vite.config.ts`
- `.svelte-kit/output/client/.vite/manifest.json`
- `node_modules/lowlight/index.js`
- `node_modules/lowlight/lib/index.js`