# {{AppName}}

Scaffolded with [fractal-svelte](https://github.com/fractalmandala/mandala/tree/main/packages/fractal-svelte-scaffold) — a mature SvelteKit + Svelte 5 + CUBE CSS + indented SASS starting point, with the Fractal Agentic Svelte Boss contract wired in.

## Quick start

```sh
pnpm install   # if you scaffolded with --no-install
pnpm dev
```

## Scripts

| Script         | What it does                              |
| -------------- | ----------------------------------------- |
| `pnpm dev`     | Vite dev server                           |
| `pnpm build`   | Production build                          |
| `pnpm preview` | Preview the build                         |
| `pnpm check`   | svelte-check (type + template validation) |
| `pnpm test`    | Vitest unit tests                         |
| `pnpm format`  | Prettier write                            |
| `pnpm lint`    | Prettier check                            |

## What's included

- **SvelteKit + TypeScript** — adapter-auto, SSR + prerender defaults.
- **Svelte 5 runes** — `$state`, `$derived`, `$effect`, `$props`. No legacy reactivity.
- **Indented SASS** — single-tab `.sass` files everywhere. No `<style>` blocks.
- **CUBE CSS token system** — two-layer (primitive → semantic) in `src/lib/styles/tokens.sass`. Light/dark via `[data-theme]`. No BEM, no Tailwind.
- **Composition utilities** — `.stack`, `.cluster`, `.grid`, `.center`, `.frame` in `src/lib/styles/layout.sass`.
- **JIT utilities** — `fractals-styler` Vite plugin generates numeric spacing/sizing classes at runtime.
- **Theme system** — no-FOUC inline script in `app.html` + runes-based store in `src/lib/utils/theme.svelte.ts`. `data-theme="light|dark"` on `<html>`.
- **Starter components** — Button, Card, Accordion, ThemeToggle under `src/lib/components/`. All follow the Svelte Boss contract (runes, external SASS, a11y, semantic tokens).
- **App shell** — Navigation + Footer + error page, with responsive mobile nav.

## Agent-ready

This project ships with the Fractal Agentic Svelte framework **wired in on disk** under `.fractal-agentic/`. An AI agent working in this repo can detect the plugin and follow the Svelte Boss contract automatically.

See [`AGENTS.md`](./AGENTS.md) for the full contract. Short prompts work out of the box:

```text
Add a Button component with primary and secondary variants.
Add a route at /docs with a sidebar layout.
Add a form with validation.
Convert this React component to SvelteKit.
```

## Styling

- **Tokens** (`src/lib/styles/tokens.sass`) — `--surface-1`, `--text-1`, `--accent`, etc. Consume these in components; never hardcode hex.
- **Composition** (`src/lib/styles/layout.sass`) — structure utilities.
- **Typography** (`src/lib/styles/typography.sass`) — text utilities.
- **Base** (`src/lib/styles/base.sass`) — reset + imports; loaded once from `+layout.svelte`.

Dark/light mode is handled by `data-theme` on `<html>` and semantic tokens that reassign per theme.

## Project layout

See [AGENTS.md](./AGENTS.md) for the full map.

## License

MIT
