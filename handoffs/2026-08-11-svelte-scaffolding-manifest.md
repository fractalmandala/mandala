---
task: svelte-scaffolding-manifest
status: done
host: codex
branch: main
boss: svelte
updated: 2026-08-11
---

# Handoff — Svelte scaffolding manifest and React-to-SvelteKit contract

## Where we are

The Svelte builder manifest routes to the real recipe files and indexes all 44 native
recipes and all 24 Svelte 5 recipes, with 14 overlapping component names. The recipe
normalization agent completed its assigned cleanup. The React-to-SvelteKit skill now has
a versioned output contract, machine-readable schema, validator, route/data-flow
guidance, SSR boundaries, dependency fallback rules, adaptive verification, and eval
fixtures. Targeted validation, `check-armory.sh`, and `verify.sh` passed.

## Decisions

- Keep `zero_js` and `svelte5` as the manifest routing keys for compatibility.
- Use `references/` as the manifest root and `references/svelte/` for Svelte 5 recipes.
- Treat native/Svelte counts as recipe counts, not unique component counts.
- Keep the React-to-SvelteKit receipt as an artifact manifest in the agent response; do
  not write it into the destination app unless explicitly requested.
- Map public route data to `+page.ts`, private/server data and form actions to
  `+page.server.ts`, API handlers to `+server.ts`, and shared data to layouts.
- Record SSR mode, browser-only APIs, guards, dependency availability/fallbacks, and
  verification evidence explicitly. Never install packages or mutate package manifests
  implicitly.

## Remaining

- [ ] Run the eval prompts against a live conversion agent and compare receipts
      qualitatively; the local schema/fixture gate is already wired into `verify.sh`.

## Gotchas

- The working tree contains unrelated user changes; preserve them.
- `bosses/svelte/INDEX.md` already had user changes before this task; this task did not
  edit it.
- The repository is currently on `main` with existing work in progress, so no branch or
  worktree was created.
- The full plugin verification reports `VERIFY PASSED`; its installer diagnostics are
  expected checks for missing/conflicting temporary targets.

## Key files

- `packages/fractal-agentic/skills/agentic-svelte-builder/references/MANIFEST.json` —
  corrected machine-readable recipe routing and counts.
- `packages/fractal-agentic/skills/agentic-svelte-builder/references/INDEX.md` —
  explains native/Svelte coverage and overlap.
- `packages/fractal-agentic/skills/agentic-svelte-builder/TASK_RECIPE_NORMALIZATION.md` —
  completed cleanup assignment and receipt contract.
- `packages/fractal-agentic/skills/react-to-sveltekit/SKILL.md` — conversion workflow and
  output contract requirements.
- `packages/fractal-agentic/skills/react-to-sveltekit/references/output-contract.md` —
  detailed output contract and artifact manifest shape.
- `packages/fractal-agentic/skills/react-to-sveltekit/references/output-contract.schema.json` —
  machine-readable contract schema.
- `packages/fractal-agentic/skills/react-to-sveltekit/scripts/validate-output-contract.py` —
  dependency-free validator used by the plugin verification gate.
- `packages/fractal-agentic/skills/react-to-sveltekit/evals/` — valid/invalid fixtures and
  prompt set for future qualitative evaluation.
- `packages/fractal-agentic/scripts/verify.sh` — plugin gate integration for the contract
  schema and fixtures.
- `packages/fractal-agentic/skills/INDEX.md` — live inventory entries for both skill packs.
