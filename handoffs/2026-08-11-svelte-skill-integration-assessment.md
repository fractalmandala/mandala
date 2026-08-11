---
task: svelte-skill-integration-assessment
status: done
host: codex
branch: main
boss: svelte
updated: 2026-08-11
---

# Handoff — Svelte skill integration assessment

## Finding

The Svelte armory already has enough capability for a short-prompt scaffolder. The
missing piece is a routing layer that composes skills by intent instead of asking agents
to read every Svelte skill. The builder and React-to-SvelteKit skills should remain the
entry points; the other skills should be routed as core, conditional, or post-build
review capabilities.

## Recommended core chain

- Component implementation: `svelte-runes` (quick reference),
  `svelte-components-patterns`, `svelte-styling-patterns`, and `frontend-a11y`.
- React conversion: `react-to-sveltekit`, then the same component chain when the output
  is a reusable component.
- SvelteKit route conversion: `sveltekit-data-flow`, `sveltekit-architecture`, and
  `sveltekit-structure` for route files, layouts, actions, errors, and SSR boundaries.
- Styling conversion: `css-to-sass` when source CSS/SCSS needs translation.

## Conditional skills

- `svelte-template-directives`: DOM integrations, `@attach`, sanitized `{@html}`, or
  complex snippet/rendering cases.
- `svelte-components`: external component libraries, web components, or advanced forms.
- `motion-ui` + `motion-foundations` + `motion-patterns`: animation work; add
  `motion-advanced` only for gestures, SVG, or imperative sequences.
- `sveltekit-remote-functions`: only when the target app has the experimental feature
  enabled and the task explicitly needs `query`, `form`, `command`, or `prerender`.
- `svelte-style-canvas`: optional visual/style QA after implementation, never the core
  scaffolding path.
- `svelte-deployment` and `vite-patterns`: adapter, build, package, or deployment work.

## Conflicts and consolidation

- `svelte-5-runes` and `svelte-runes` substantially overlap. Make `svelte-runes` the
  short router and move unique deep guidance from `svelte-5-runes` into references.
- `sveltekit-architecture`, `sveltekit-data-flow`, and `sveltekit-structure` overlap.
  Keep data-flow as the conversion decision authority, architecture as composition,
  and structure as a short path/layout/error lookup; cross-link them rather than loading
  all three by default.
- `svelte-styling` recommends component `<style>` blocks and `style:` directives. That
  conflicts with the Svelte Boss contract for this repo. Do not auto-route it for
  builder/conversion output; use only its CSS custom-property ideas when compatible.
- Motion skills contain inline-style examples and motion-package assumptions. Apply them
  only after dependency and styling-policy checks; otherwise use native transitions or
  external SASS and record the fallback.

## Implemented

- Added `agentic-svelte-builder/references/SKILL_ROUTING.md` as the human routing guide.
- Added `agentic-svelte-builder/references/SKILL_ROUTING.json` as the machine-readable
  intent matrix and policy source.
- Added `agentic-svelte-builder/scripts/validate-skill-routing.py` to verify route shape
  and resolve every referenced skill on disk.
- Added `agentic-svelte-builder/scripts/resolve-skill-route.py` and nine short-prompt
  cases under `agentic-svelte-builder/evals/skill-routing.json`.
- Updated the builder and React conversion entry skills to use the routing matrix.
- Wired routing validation and short-prompt resolution checks into `scripts/verify.sh`.

## Next iteration

- Run the four live prompts plus dedicated DOM-integration, form-action, and motion
  prompts against the router.
- Consider an optional `appliedSkills` receipt field in a future output-contract version;
  current routing names are required in the human receipt, not persisted in destination
  projects.
