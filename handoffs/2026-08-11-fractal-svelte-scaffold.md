# Handoff: fractal-svelte scaffold CLI (Phase 1)

**Branch:** `feat/scaffold-fractal-svelte`
**Worktree:** `/Users/amrit/src/mandala/feat/scaffold-fractal-svelte`
**Package:** `packages/fractal-svelte-scaffold` (npm name: `fractal-svelte`)

## What shipped (Phase 1)

A zero-runtime-dependency CLI that scaffolds a mature, agent-ready SvelteKit + Svelte 5 +
CUBE CSS + indented SASS project with the Fractal Agentic Svelte Boss contract **wired in
on disk** (bundled armory, not an npm dependency).

### Delivered

1. **Project skeleton + tooling** — SvelteKit + TS + pnpm, `svelte-check`, prettier,
   vitest. `pnpm dev` / `build` / `check` work out of the box.
2. **CUBE CSS tokens + theme + utilities** — two-layer token system (primitive →
   semantic) in `tokens.sass`, light/dark via `data-theme` + no-FOUC script, CUBE
   composition utilities (`.stack`, `.cluster`, `.grid`, `.center`, `.frame`),
   `fractals-styler` JIT plugin wired in `vite.config.ts`.
3. **App shell + layouts + routing** — root `+layout.svelte` with Navigation/Footer,
   `+error.svelte`, `about/+page.svelte` sample route group, prerender/SSR defaults.
4. **Starter components** — Button, Card, Accordion, ThemeToggle, all following the
   Svelte Boss contract (runes, external SASS, no `<style>` blocks, no inline styles,
   no hex fallbacks, a11y, `onclick` not `on:click`).
5. **Agent-ready wiring (the leading spec)** — `AGENTS.md` project mandate +
   `.fractal-agentic/` armory copied into every scaffolded project: plugin.json,
   23 skills (builder, runes, components, styling, a11y, sveltekit-*, motion-*, css-to-sass),
   svelte-framework docs, Svelte Boss playbook, commands. Standalone — no
   `fractal-agentic` npm dependency.

### Patterns taken from admin/gui

- no-FOUC theme script (app.html) — adapted, dropped noise/gradient
- runes-based theme store (from theme.ts, rewritten from writable store → $state)
- Navigation logic/view split (Navigation.ts + Navigation.svelte)
- SvelteKit route conventions (+layout.ts prerender/trailingSlash)
- Button/Card/Accordion API surfaces — rebuilt to Svelte Boss contract (external SASS,
  no Tailwind, no `<style>` blocks)

### Verification (all green)

- Scaffold package `tsc` — compiles clean
- Smoke scaffold into /tmp → `pnpm check`: **0 errors, 0 warnings**
- `pnpm lint`: **all files pass**
- `pnpm build`: **succeeds** (adapter-auto)
- `node dist/cli.js` (published bin form): scaffolds + copies armory correctly

### How to use

```sh
npx fractal-svelte my-app
cd my-app && pnpm dev
```

### Phase 2 (deferred, from admin/gui)

- Full docs system (sidebar + search + markdown loading + `sections.json`)
- Icon system
- Auth, splash, toast, view transitions, settings, modal

### Merge

```sh
cd /Users/amrit/mandala
git merge --no-ff feat/scaffold-fractal-svelte
```
