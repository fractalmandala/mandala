---
task: svelte-recipe-normalization
status: done
host: opencode
branch: current worktree
boss: svelte
updated: 2026-08-11
---

# Handoff — Normalize Svelte recipe references

## Where we are
All native and Svelte recipe references in the two owned packs were normalized for the
Svelte 5/CUBE contract. React-to-SvelteKit examples now include target file plans,
dependency fallback decisions, migration decisions, and accessibility boundaries.
Required JSON, armory, and plugin verification commands pass.

## Decisions
- Component styling is shown in adjacent indented `.sass` blocks; no recipe component
  embeds a `<style>` block.
- State and variants use semantic attributes rather than modifier classes.
- Dynamic geometry uses documented CSS custom-property boundaries.
- Direct `$derived(expression)` forms are used; browser globals remain in `$effect`.
- Existing unrelated dirty-tree changes were not touched.

## Remaining
- [x] Normalize both recipe packs.
- [x] Run task verification commands.
- [x] Complete read-only final Svelte review with `ship` verdict.

## Gotchas
- The supplied forbidden-pattern regex reports valid `#each` and Svelte `transition:`
  syntax as false positives; no actual forbidden constructs remain.
- Capability pins were not exposed in this session: `capability_mode: fallback` and
  `pins: unverified`.

## Key files
- `packages/fractal-agentic/skills/agentic-svelte-builder/references/` — native and
  Svelte recipe catalog.
- `packages/fractal-agentic/skills/react-to-sveltekit/references/` — conversion recipes.
- `packages/fractal-agentic/skills/agentic-svelte-builder/SKILL.md` — external stylesheet
  and semantic state guidance.
- `packages/fractal-agentic/skills/react-to-sveltekit/SKILL.md` — external SASS and
  conversion guidance.
