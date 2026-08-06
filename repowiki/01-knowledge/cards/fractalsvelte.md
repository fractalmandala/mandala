---
title: fractalsvelte
description: SvelteKit component library — no Tailwind, props-based customization, dual npm+copy-paste distribution, docs chrome conventions.
tags: [package, fractalsvelte, sveltekit, component-library, dual-distribution]
type: card
module: packages/fractalsvelte
path: /Users/amrit/mandala/packages/fractalsvelte
created: 2026-08-04
updated: 2026-08-04
relates_to: [mandala-root, packages, conventions, shradhapp]
---

# fractalsvelte

- **Path:** `/Users/amrit/mandala/packages/fractalsvelte`
- **What:** A components library for SvelteKit with **no Tailwind, no class-string merging**, customization through props. An attempt to replicate shadcn-svelte without Tailwind.
- **Ship:** from `src/lib/` (SvelteKit keeps lib separate); docs site in `src/routes/docs/`, page content in `src/content/components/`.
- **Dual distribution:** published to npm **and** copy-pasteable. A flattened copy-paste variant (mixins inlined, shared classes resolved) is generated from the same source — never hand-maintained.
- **Docs chrome:** `Preview`, `Examples`, `PropsTable` (comes *after* Examples), `CodeBlock`, `Sidebar`, `Toc` — all in `src/lib/docs/`.
- **Page structure:** `<h1 doc-title>` + `<p doc-lede>` → hero `<Preview>` → Installation (npm **and** copy-paste) → Usage → Examples → Props → Theming.
- **Radius:** `--doc-r` 3px, `--doc-r-lg` 6px for large surfaces; no single-side accent borders.
- **Prose rule:** selectors in `docs.sass` must exclude `[data-slot]` so rendered components inside `.doc-article` don't inherit prose styling (e.g. `<Button href>` is an `<a>`).
