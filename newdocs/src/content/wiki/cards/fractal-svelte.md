---
title: fractal-svelte
description: Spring-animated UI primitives, agent components, and product blocks for Svelte 5 — motion-driven component library by Fractaldesign.
tags: [package, svelte, sveltekit, ui, components, animation]
type: card
module: packages/fractal-svelte
path: packages/fractal-svelte
created: 2026-08-06
updated: 2026-08-06
---

`@fractaldesign/fractal-svelte` is a Svelte 5 component library organized around spring-based motion, agent-facing UI, and product blocks. It ships prebuilt through `svelte-package` with a public catalog checked by scripts.

## What it provides

- **Motion primitives** — spring-animated building blocks under `src/lib/motion/`, with shared easing curves exported as `./ease` and a token-driven style layer under `src/lib/styles/`.
- **UI components** — button, tabs, switch, checkbox, radio, tooltip, input, loader, number, marquee, animated badge, text animation, theme toggle, expandable action bar, bouncy accordion, overflow actions.
- **Agent components** — prompt input, message, message bubble, streaming response, message scroller, todo list, approval card, file diff, AI sidebar, notification stack, feedback widget, not-found.
- **Catalog** — `src/lib/catalog/` drives `scripts/generate-catalog.ts`; a suite of check scripts (`check-exports`, `check-component-completeness`, `check-catalog`, `check-styles`, `check-registry`, `check-public` keep exports and docs in sync.

## Structure

```
src/lib/
  motion/       # spring/motion primitives
  components/   # UI + agent components + product blocks
  styles/       # token-driven style layer
  catalog/      # component catalog data
```

Exports are granular subpaths (`.`, `./styles`, `./ease`, plus one per component), so consumers import only what they need.

## Usage

```svelte
<script>
  import { Button } from "@fractaldesign/fractal-svelte";
</script>

<Button>Get started</Button>
```

## Tooling

- `pnpm build` → `svelte-package` + `publint` (`prepack`.
- `pnpm test` → Vitest unit tests.
- `pnpm check` → `svelte-check`.
- `pnpm lint` / `format` → ESLint + Prettier.
