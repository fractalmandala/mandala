---
title: Fractal Sites — Static Documentation & Knowledge Publishing Hub — Coding Conventions
description: - Each site follows the SvelteKit file-based routing convention with +layout.svelte, +page.svelte, and +page.ts files under src/routes/.
tags: [sites]
type: card
module: sites
path: sites
created: 2026-08-05
updated: 2026-08-06
---

- Each site follows the SvelteKit file-based routing convention with `+layout.svelte`, `+page.svelte`, and `+page.ts` files under `src/routes/`.
- Content is authored as Markdown/MDSVX files in a `content/` directory with frontmatter metadata, processed through mdsvex.
- Development tooling is standardized: TypeScript, ESLint with `eslint-plugin-svelte`, Prettier with `prettier-plugin-svelte`, and `svelte-check` for type checking.
- Styling uses Sass alongside Tailwind-compatible CSS, with `fractals-styler` as a shared design system dependency across multiple sites.
- Build scripts include `prepare: svelte-kit sync || echo ''` and separate `check`/`lint`/`format` scripts for consistent developer experience.
