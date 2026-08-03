# Fractal Agentic site

Human-facing **website and armory explorer**. Not the agent package.

## Source of truth

| Content | Lives in |
| --- | --- |
| Agent identity, bosses, skills, commands, policy | **`../plugin/`** |
| Credits | **`../credits.json`** |
| UI, routing, styling | **this `site/` folder** |

Vite loads plugin markdown via `import.meta.glob` on `../plugin/**` (see `src/lib/content/catalog.ts`).  
**Do not** put agent-required docs only under `site/` — agents never load this tree on a plugin-only install.

## Run

```sh
pnpm install
pnpm dev
```

## Related

- Repo layout: [`../LAYOUT.md`](../LAYOUT.md)
- Product package: [`../plugin/README.md`](../plugin/README.md)
- Shipped docs index: [`../plugin/docs/INDEX.md`](../plugin/docs/INDEX.md)
