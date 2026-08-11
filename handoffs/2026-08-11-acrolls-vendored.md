---
task: vendor-acrolls-into-mandala
status: ready-to-commit
host: codex
updated: 2026-08-11T18:56:00+05:30
---

# Handoff — Acrolls vendored into Mandala

Acrolls source, docs, ADRs, CLI, examples, and nested packages now live under
`packages/acrolls/`. The Mandala root workspace excludes the nested Acrolls workspace root and
includes `packages/acrolls/packages/*` plus `packages/acrolls/examples/*`, so the `@acrolls/*`
packages participate in the Mandala install/build graph without bringing in Acrolls' own
`node_modules`, `.git`, generated `dist`, or SvelteKit output.

## Verification

- Acrolls runtime package builds from Mandala: mdsvex, svelte, docs, sveltekit, and cli.
- Checks: mdsvex, svelte, docs, sveltekit, and cli pass; Svelte emits the existing deprecated
  `<slot>` warning in `PublicationLayout.svelte`.
- Tests: mdsvex 23/23, docs 26/26, cli 9/9.
- Vendored CLI validation: `1 discovered · 1 ready · 0 normalized · 0 rejected` for the starter
  article.
- Outer `pnpm-lock.yaml` was regenerated for 24 workspace projects.

The Mandala working tree contains unrelated pre-existing modifications; only the Acrolls vendor,
workspace metadata, README/AGENTS entries, and related handoff are staged for this integration.
