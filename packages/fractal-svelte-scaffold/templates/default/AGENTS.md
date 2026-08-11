# AGENTS.md — {{name}}

This project was scaffolded with **fractal-svelte**. It is a SvelteKit + Svelte 5 +
indented SASS + CUBE CSS project, and the Fractal Agentic Svelte Boss contract is
**wired in on disk** under `.fractal-agentic/`.

You do not need to install anything else to extend this project. The agent armory —
skills, routing, recipes, docs, and the Svelte Boss playbook — is already here.

## Setup (already done)

- SvelteKit + TypeScript + pnpm
- Svelte 5 runes (no legacy `$:` or `svelte/store` imports)
- Indented SASS (`*.sass` — single tab, no braces, no semicolons)
- CUBE CSS token system in `src/lib/styles/`
- `fractals-styler` JIT utility-class plugin wired in `vite.config.ts`
- Light/dark theme via `[data-theme]` + no-FOUC script in `src/app.html`
- Sample components (Button, Card, Accordion, ThemeToggle) under `src/lib/components/`

## Commands

```sh
pnpm dev      # dev server
pnpm build    # production build
pnpm check    # svelte-check (type + template validation)
pnpm test     # vitest
pnpm format   # prettier
pnpm lint     # prettier check
```

## Fractal Agentic (required session bootstrap)

The plugin root is `.fractal-agentic/` in this project. Before extending this project
on a non-trivial task (add a component, route, page, style system, or port), detect
the plugin and follow its process:

1. **Detect** — the plugin root is `.fractal-agentic/`. Confirm `.fractal-agentic/plugin.json`
   exists. If `FRACTAL_AGENTIC_ROOT` is unset, set it to `.fractal-agentic` for the session.
2. **Read** the plugin `AGENTS.md` (`.fractal-agentic/AGENTS.md`), then
   `skills/boss-orchestration/SKILL.md`.
3. **Select the Svelte Boss** — read `.fractal-agentic/docs/bosses/svelte/INDEX.md`.
   This project is Svelte 5 + SvelteKit + indented SASS; the Svelte Boss owns it.
4. **Use the svelte-framework docs** at `.fractal-agentic/docs/svelte-framework/INDEX.md`
   for how-to guides, recipes, and the prompt routing matrix.
5. **Follow the Svelte Boss contract** (see below) for all generated output.

### Trivial exemption

Single-sentence answers, pure explanation with no code change, or "what is X?"
questions may skip orchestration. Answer directly.

## Svelte Boss contract (enforced on all generated output)

These rules are **stricter than generic Svelte examples**. They keep the project
surface repeatable across many agents and sessions.

- **Svelte 5 runes only.** `$state`, `$derived`, `$effect`, `$props`, `$bindable`.
  No legacy `$:` reactivity. No `svelte/store` `writable`/`readable` imports —
  use runes (`$state`) for reactive state. (`svelte/reactivity` classes like
  `SvelteSet`/`SvelteMap` are allowed.)
- **Native semantic HTML before custom ARIA.** Use `<button>`, `<a>`, `<details>`,
  native form controls, etc. before inventing custom roles.
- **`onclick`, not `on:click`.** Use the new event-attribute syntax everywhere.
- **Snippets and `{@render}` instead of slots.** No slot-based APIs.
- **External indented SASS for custom styling.** Each component's styles live in a
  sibling `.sass` file imported by the `.svelte` file (e.g. `Button.svelte` imports
  `./Button.sass`).
- **No `<style>` blocks in `.svelte` components.** No inline `style="..."` attributes.
- **No `class:` directives.** Use plain `class={cond ? 'a' : 'b'}` or `class:foo={cond}`
  is forbidden — use `class={...}` with template strings.
- **Semantic CSS variables and `data-state`/`data-variant` attributes** for theming,
  not utility classes that hardcode colors.
- **No fallback hex color values.** Consume semantic tokens from
  `src/lib/styles/tokens.sass` (e.g. `var(--surface-1)`, `var(--text-1)`, `var(--accent)`).
- **No implicit dependency installation** or `package.json` mutation. Ask the user
  before adding a dependency.
- **SSR and browser boundaries are explicit.** Guard `window`/`document`/`localStorage`
  access with `browser` from `$app/environment`.
- **Verification evidence comes from actual files and actual commands.** Run
  `pnpm check` after changes; report the real output.

## CUBE CSS styling system

This project uses CUBE CSS (Composition, Utility, Block, Exception) — not BEM, not
Tailwind. The layering:

- **Tokens** (`src/lib/styles/tokens.sass`) — primitive → semantic, two-layer.
  Components consume semantic tokens only (`--surface-1`, `--text-1`, `--accent`...).
- **Composition** (`src/lib/styles/layout.sass`) — `.stack`, `.cluster`, `.grid`,
  `.center`, `.frame`, `.cover`, `.with-sidebar`, `.bleed`. Structure only.
- **Typography** (`src/lib/styles/typography.sass`) — `.text-*`, `.font-*`,
  `.leading-*`, `.measure-*`, `.h1`–`.h4`.
- **JIT utilities** (`fractals-styler` Vite plugin) — numeric spacing/sizing classes
  (e.g. `gap4`, `pad8`, `height100`) generated at runtime.
- **Blocks** (component `.sass` files) — visual treatment for a specific component.

Import `src/lib/styles/base.sass` once from `src/routes/+layout.svelte`; it pulls in
tokens, typography, layout, and the reset.

## How to add common things (short prompts)

These are the intended user-facing flows. The agent resolves the route, recipes, and
skills automatically.

- **"Add a Button"** → recipe in `.fractal-agentic/skills/agentic-svelte-builder/`,
  written to `src/lib/components/Button/` per the Boss contract.
- **"Add a route at /docs"** → `src/routes/docs/+page.svelte` + `+page.ts` (load)
  following SvelteKit data-flow conventions.
- **"Add dark mode to a component"** → consume `var(--*)` semantic tokens; the
  `[data-theme]` attribute handles the switch. No new logic.
- **"Convert this React component"** → `.fractal-agentic/skills/react-to-sveltekit/`
  conversion contract; runes + SASS + a11y per the Boss contract.
- **"Set up a basic docs layout"** → layout composition (`.with-sidebar` or `.stack`)
  - a `+page.ts` load function + a markdown renderer. See the svelte-framework
    how-to guides under `.fractal-agentic/docs/svelte-framework/how-to/`.

## Project layout

```
src/
  app.html                       no-FOUC theme script
  app.d.ts
  lib/
    styles/
      tokens.sass                primitive → semantic tokens, light/dark
      typography.sass            text/heading utilities
      layout.sass                CUBE composition utilities
      base.sass                  reset + base, imports the above
    components/
      Button/  Card/  Accordion/  ThemeToggle/
    layout/
      Navigation.svelte + .ts + Navigation.sass
      Footer.svelte + Footer.sass
    utils/
      theme.svelte.ts            runes-based theme store
  routes/
    +layout.svelte + +layout.sass + +layout.ts
    +page.svelte + +page.sass
    about/+page.svelte
    +error.svelte + +error.sass
```
