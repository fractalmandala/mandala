# testsite

A SvelteKit docs site that serves markdown **straight from folders** — no renaming files to
`+page.md`, no per-file routes. It wears the **fractaldesign docs shell** (light + dark oklch
theme, topbar / sidebar / TOC three-column layout) extracted from `fractaldesign-docs-shell-2.html`.

## Routes

| Route | Page |
| --- | --- |
| `/` | Home — hero, collection cards, recent writing |
| `/posts` | Posts collection index (log rows) |
| `/sveltemotion` | SvelteMotion collection index |
| `/posts/[slug]` | One post (`/posts/ai`, `/posts/seoinsveltekit`, …) |
| `/sveltemotion/[slug]` | One SvelteMotion doc (`/sveltemotion/use-animate`, …) |

## How it works

- Content lives in two top-level folders: `posts/*.md` and `sveltemotion/*.md`
  (copied from `../testdocs`).
- `src/lib/server/markdown.ts` globs those folders with `import.meta.glob(..., { query: '?raw' })`,
  parses YAML frontmatter with `gray-matter`, and renders markdown → HTML with a
  unified pipeline: `remark-parse` → `remark-gfm` → `remark-rehype` → shiki →
  `rehype-slug` → `rehype-sanitize` → `rehype-stringify`. `extractHeadings()` pulls the
  h2/h3 anchors for the on-this-page TOC.
- The shell (topbar, sidebar, TOC rail, theme toggle, mobile drawer) lives in
  `src/routes/+layout.svelte` + `+layout.server.ts`; the design system is
  `src/lib/styles/shell.css`.

## Why not mdsvex?

mdsvex (what `fractalmandala` uses) compiles `.md` files into Svelte components — great when
your markdown uses runes and `$lib` imports. The `sveltemotion/` docs are foreign MDX that
import another project's components, so mdsvex can't compile them here. The unified pipeline
instead strips raw `<script>` blocks and foreign component tags (sanitize runs last), leaving
clean, safe prose — with an "Imported MDX" callout on those pages.

## Theme contract

`data-theme` on `<html>`: `light` | `dark`. Bootstrapped pre-paint in `src/app.html`
(localStorage `fd-docs-theme`, falling back to `prefers-color-scheme`); toggled by the
sun/moon button in the topbar.

## Gotcha discovered greenfield

The current `sv create` template passes options through `vite.config.ts`'s `sveltekit()` plugin.
When options are passed there, **`svelte.config.js` is ignored entirely** — so `preprocess`
(needed for SASS) must be configured inside `vite.config.ts`.

## Run

```bash
pnpm install
pnpm dev      # dev server
pnpm check    # svelte-check
pnpm build    # production build (adapter-auto)
```
