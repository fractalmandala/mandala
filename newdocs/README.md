# newdocs (Fractalwiki)

SvelteKit docs site for the mandala monorepo wiki.

## Pipeline

```text
repowiki/  (vault)
  → scripts/sync-wiki.mjs  →  src/content/**
  → content-list (nav/list) + content-page (mdsvex article)
  → /docs routes
  → postbuild pagefind  →  /pagefind/*
```

| Env | Default | Purpose |
|-----|---------|---------|
| `WIKI_VAULT_PATH` | `../repowiki` (next to this package) | Source vault |
| `WIKI_OUT` | `src/content` | Content mirror |

## Scripts

```sh
pnpm install
pnpm dev          # sync vault + vite dev
pnpm build        # sync + build + pagefind index
pnpm preview
pnpm test         # unit tests (slug, frontmatter, links, nav tree)
pnpm check        # svelte-check
pnpm sync:wiki    # vault sync only
pnpm pagefind     # re-index after a build
```

## Content model

- Markdown under the vault is mirrored into `src/content/`.
- `INDEX.md` / `index.md` map to the parent URL (`projects/INDEX.md` → `/docs/projects`).
- Local `.md` links are rewritten to `/docs/…` at compile time.
- Sidebar sections are configured in `src/lib/docs/config.ts` with nested trees from the filesystem.

## Search

Full-text search uses [Pagefind](https://pagefind.app/). Index is generated on `pnpm build` from prerendered HTML (`data-pagefind-body` on articles). In `pnpm dev`, Pagefind is usually unavailable until you build once (nav browse still works).
