---
status: completed
branch: main
timestamp: 2026-08-11T21:30:00-07:00
files_modified:
  - packages/fractal-svelte-scaffold/ (new, merged via 47f5dff25 + 46b2b2454 + 346bf835f)
  - handoffs/2026-08-11-fractal-svelte-scaffold.md
---

## Working on: fractal-svelte SvelteKit scaffold CLI (Phase 1)

### Summary

Built and merged a zero-dep CLI (`fractal-svelte`) that scaffolds a mature, agent-ready
SvelteKit + Svelte 5 + CUBE CSS + indented SASS project with the Fractal Agentic Svelte
Boss contract wired in on disk. Phase 1 complete and landed on main.

### Decisions Made

- **CLI form (not template repo)** — publishable as `npx fractal-svelte my-app`. Zero
  runtime deps for v1; flags only, interactive prompts deferred to fast-follow.
- **npm name `fractal-svelte`, folder `packages/fractal-svelte-scaffold`** — owner owns
  the npm package name; folder differs to avoid collision with the existing
  `@fractaldesign/fractal-svelte` motion-components package.
- **Armory bundled, not dep'd** — `.fractal-agentic/` (plugin.json + 23 skills +
  svelte-framework docs + Svelte Boss playbook + commands) is copied into every
  scaffolded project so it's standalone. No `fractal-agentic` npm dependency.
- **Took architecture from admin/gui, rebuilt files** — admin/gui is Tailwind-coupled
  and violates the Svelte Boss contract. Took patterns (no-FOUC theme script, runes-based
  theme store, Navigation logic/view split, SvelteKit route defaults) and rewrote
  implementations in external indented SASS.
- **CUBE CSS two-layer tokens** — primitive (`--c-*`) → semantic (`--surface-1`,
  `--text-1`, `--accent`), light/dark via `[data-theme]`. No BEM, no Tailwind, no hex
  fallbacks. Composition utilities (`.stack`/`.cluster`/`.grid`/`.center`/`.frame`) +
  `fractals-styler` JIT wired in `vite.config.ts`.
- **Svelte Boss contract enforced** on all generated components: runes, external `.sass`,
  no `<style>` blocks, no inline styles, no `class:` directives, no hex, `onclick` not
  `on:click`, native semantic HTML before ARIA, a11y (`aria-expanded`, keyboard handlers).
- **Part 2 (svelte-framework) reviewed first** — confirmed well-set-up: SKILL_ROUTING.json
  matches disk, all 22 supporting skills exist, links resolve, validators exist. Minor
  nits: cross-link boss playbook → svelte-framework docs, don't hardcode recipe counts.

### What's in the scaffolded project

- SvelteKit + TS + pnpm, `svelte-check`/prettier/vitest, `pnpm dev`/`build`/`check` green
- `src/lib/styles/{tokens,typography,layout,base}.sass` — CUBE CSS system
- `src/lib/components/{Button,Card,Accordion,ThemeToggle}/` — Boss-contract components
- `src/lib/layout/{Navigation,Footer}.svelte` + `Navigation.ts` — logic/view split
- `src/lib/utils/theme.svelte.ts` — runes-based theme store
- `src/routes/{+layout,+page,about/+page,+error}` — app shell + sample route
- `src/app.html` — no-FOUC theme script
- `AGENTS.md` — project mandate (detect plugin, Svelte Boss contract, short-prompt flows)
- `.fractal-agentic/` — bundled armory (plugin.json, 23 skills, docs, boss playbook, commands)

### Verification (all green)

- `pnpm check`: 0 errors, 0 warnings
- `pnpm lint`: all files pass prettier
- `pnpm build`: succeeds (adapter-auto)
- `node dist/cli.js` (published form): scaffolds + copies armory correctly

### Remaining Work (Phase 2, deferred per user)

- Full docs system from admin/gui: sidebar + `⌘K` search + markdown loading + `sections.json`
  schema + `marked`/`DOMPurify` integration
- Icon system (admin/gui's 10-file `icons/` set is too app-specific; rebuild minimal)
- Auth, splash screen, toast, view transitions, settings, modal
- Interactive CLI prompts (v1 is flags-only)
- SEO & meta component + sitemap/robots routes (not picked in Phase 1)
- GitHub Actions CI workflow (not picked in Phase 1)
- Blog/MDsveX content loading
- Publish `fractal-svelte` to npm

### Notes

- Pre-existing uncommitted changes in main worktree (`.claude/launch.json`, `.freebuff/*`,
  `mandala.code-workspace`, `packages/fractal-agentic/*` docs tweaks,
  `packages/fractals-styler/src/lib/AppShell.svelte`) were there before this task and
  left untouched.
- `pnpm-lock.yaml` had a merge conflict during `--no-ff` merge (main had uncommitted
  lockfile changes). Resolved by taking merged version + `pnpm install` regenerate +
  commit `346bf835f`.
- pnpm v11 requires `allowBuilds:` in `pnpm-workspace.yaml` (not `onlyBuiltDependencies:`
  in package.json) — added `esbuild: true` + `@parcel/watcher: true` to template.
- `.sass` files have no prettier parser — they're skipped by `pnpm lint` (expected).
- Worktree `feat/scaffold-fractal-svelte` was created at
  `~/src/mandala/feat/scaffold-fractal-svelte`, merged, and pruned via `scripts/wt.sh rm`.
- The detailed build-spec handoff is at
  `handoffs/2026-08-11-fractal-svelte-scaffold.md` (written from the worktree before
  merge; now on main).
