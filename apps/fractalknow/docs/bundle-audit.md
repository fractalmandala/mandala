# FractalKnow Bundle And Dynamic Import Audit

Date: 2026-07-31
Scope: built SvelteKit client output in `/Users/amrit/fractals/apps/fractalknow/build`

## Method

- Build the SvelteKit/Tauri frontend with `pnpm build`.
- Run `pnpm run audit:bundle` to inspect `build/_app/immutable`.
- Record total raw/gzip artifact size, the largest gzip artifacts, and every static dynamic import expression under `src/`.

## Current Dynamic Imports

- `src/lib/components/editor/SourceEditor.svelte` dynamically imports CodeMirror packages for source editing.
- `src/lib/components/editor/RichEditor.svelte` dynamically imports Tiptap packages for rich editing.
- `src/lib/desktop/bridge.ts` dynamically imports Tauri API modules only when the Tauri runtime is available.

These imports keep editor and desktop-only dependencies out of the initial Svelte component evaluation path.

## Current Measurement

- Command: `pnpm build && pnpm run audit:bundle`
- Artifacts: 29 built JS/CSS client artifacts.
- Total raw size: 1.22 MB.
- Total gzip size: 412.7 kB.
- Largest gzip artifact: `build/_app/immutable/chunks/6AlqD9SA.js` at 89.5 kB gzip.
- Runtime dynamic import sites: CodeMirror, Tiptap, and Tauri bridge modules only.

## Follow-Up Criteria

- Re-run the audit after project-backed persistence, collaboration, terminal PTY integration, and native updater dependencies are finalized.
- Investigate any single gzip chunk above 250 kB or any total gzip client output above 750 kB before release packaging.
- Keep editor/collaboration integrations lazy-loaded unless they are required for first paint.

## Evidence

- Audit script: `scripts/audit-bundle.mjs`
- Local commands to re-run:
	- `pnpm build`
	- `pnpm run audit:bundle`
