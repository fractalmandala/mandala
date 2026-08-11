# fractal-svelte

A SvelteKit scaffold CLI. Scaffolds a mature, agent-ready SvelteKit + Svelte 5 + CUBE CSS + indented SASS project with the Fractal Agentic Svelte Boss contract wired in on disk.

## Usage

```sh
npx fractal-svelte my-app
# or
pnpm dlx fractal-svelte my-app
```

Then:

```sh
cd my-app
pnpm dev
```

## Flags

```
fractal-svelte <project-name> [options]

Options:
  -t, --template <name>   template to use (default: default)
  --no-git                skip git init
  --no-install            skip pnpm install
  -h, --help              show help
```

## What it scaffolds

- SvelteKit + TypeScript + pnpm, runnable out of the box (`pnpm dev` / `pnpm build` / `pnpm check`)
- Svelte 5 runes (no legacy reactivity)
- Indented SASS everywhere (single-tab `.sass`, no `<style>` blocks)
- CUBE CSS two-layer token system (primitive → semantic), light/dark via `data-theme`
- Composition utilities (`.stack`, `.cluster`, `.grid`, `.center`, `.frame`)
- `fractals-styler` JIT utility-class plugin wired into Vite
- No-FOUC theme script + runes-based theme store
- Starter components (Button, Card, Accordion, ThemeToggle) following the Svelte Boss contract
- App shell: Navigation + Footer + error page, responsive
- `AGENTS.md` project mandate + `.fractal-agentic/` armory copied in (skills, routing, recipes, docs, Svelte Boss playbook)

The scaffolded project is **standalone and agent-ready** — an AI agent can extend it using short prompts, following the on-disk Svelte Boss contract. No `fractal-agentic` npm dependency required at runtime.

## Development

```sh
pnpm install
pnpm build      # compile CLI to dist/
pnpm smoke      # scaffold a __smoke__ test project
```

## License

MIT
