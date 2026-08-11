---
task: svelte-framework-documentation
status: done
host: codex
branch: main
boss: svelte
updated: 2026-08-11
---

# Handoff — Svelte framework documentation

## Outcome

Added a complete Diátaxis documentation surface for developers, SvelteKit website
builders, and coding agents. The docs are shipped under the installable plugin package
and are linked from the main package documentation guide.

## Documentation surface

- `packages/fractal-agentic/docs/svelte-framework/INDEX.md` — user-facing hub.
- `tutorials/` — first Button, Accordion, and SvelteKit route walkthroughs.
- `how-to/` — components, React/Next conversion, route data and SSR, SASS/tokens,
  accessibility, motion, DOM integrations, remote functions, deployment, receipts,
  and fix-first troubleshooting.
- `reference/` — prompt routing, recipe catalog, skill surfaces, conversion output
  contract, verification, plugin layout, and command invocation.
- `explanation/` — architecture, ambition, routing, boss contract, implementation
  choices, SSR boundaries, fallbacks, and conditional skills.

The ambition explanation includes an explicitly illustrative complete SvelteKit scaffold
tree and maps the shape of `agmmnn/tauri-ui` to this framework without claiming that the
external project uses the same paths.

## Packaging and source decisions

- User documentation stays in `packages/fractal-agentic/docs/`, the plugin's shipped
  documentation surface.
- Executable Python/JavaScript remains in skill `scripts/`; detailed machine-facing
  references remain in skill `references/`.
- The docs explain the official Codex plugin shape and link to OpenAI's plugin guidance.
- `docs/INDEX.md` and `docs/doc-ownership.md` now expose the Svelte Framework hub.

## Verification

- Changed-doc frontmatter and local-link validation: passed (32 changed documentation
  files, 92 links).
- `packages/fractal-agentic/scripts/check-armory.sh`: passed.
- `packages/fractal-agentic/scripts/verify.sh`: passed.
- The full historical docs tree still contains pre-existing route-style links such as
  `/skills` and one legacy relative command link; those were excluded from the changed-
  docs gate and were not altered by this task.
- Model pins remain unverified; capability fallback is acceptable under plugin policy.

## Next iteration

If the website needs dedicated navigation, add the Svelte Framework hub to its docs
sidebar presentation layer. Keep product facts and all offline-readable content in this
package; do not move them into `sites/fractalagentic/`.
