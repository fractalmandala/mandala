---
title: Fractalwiki SvelteKit Documentation Site — Coding Conventions
description: - Server-side data loading is done through SvelteKit's LayoutServerLoad and PageServerLoad exports that return plain objects consumed by +page.svelte / +layout.svelte via $props() destructuring.
tags: [sites/fractalwiki]
type: card
module: sites/fractalwiki
path: sites/fractalwiki
created: 2026-08-05
updated: 2026-08-06
---

- Server-side data loading is done through SvelteKit's `LayoutServerLoad` and `PageServerLoad` exports that return plain objects consumed by `+page.svelte` / `+layout.svelte` via `$props()` destructuring.
- All server modules cache their results in module-level variables and short-circuit on `process.env.NODE_ENV === 'production'` to avoid repeated I/O after first load.
- Configuration is loaded from `site-config.json` via typed interfaces declared in `config.ts`, with a try/catch fallback returning sensible defaults when the file is missing.
- Markdown content uses YAML frontmatter delimited by `---` blocks parsed by a custom `parseFrontmatter` function, supporting scalar values, inline arrays `[a,b]`, and indented list items under a key.
- Styling uses SASS without curly braces or semicolons, imports `virtual:fractals-styler.css` plus `$lib/styles/index.sass`, and relies on `fractals-styler` utility classes (e.g., `padN`, `gapN`, `-xs/-sm` breakpoint suffixes) rather than hand-written CSS.
- Document slugs are constructed as `<cleanGroupId>/<sectionId>/<relativeDocPath>` where group IDs have slashes replaced by hyphens, and index files (`INDEX.md`, `CONTENTS.md` map to the parent directory slug.
