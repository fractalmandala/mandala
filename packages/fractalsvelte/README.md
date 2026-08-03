# Fractalsvelte

A components library for Sveltekit with no Tailwind, no class-string merging,
and customisation exposed through props. The docs site lives in `src/routes/docs/`; page content lives in `src/content/components/`.

The library still ships from `src/lib/` — SvelteKit keeps them separate automatically.

## Page structure

1. `<h1 class="doc-title">` + `<p class="doc-lede">`
2. Hero `<Preview>`
3. **Installation** — npm install *and* copy-paste. We ship both.
4. **Usage** — import + minimal example
5. **Examples** — one `<Examples>` tabbed area
6. **Props** — `<PropsTable>`. Comes *after* Examples: people look for a working example
   first and reach for the API reference second.
7. **Theming** — the tokens the component reads

## Chrome conventions

- **Radius is 3px (`--doc-r`), or 6px (`--doc-r-lg`) for large surfaces** — preview frames,
  tables, cards, drawers. Nothing rounder, and no single-side accent borders: they look
  wrong where the accent meets a rounded corner.
- **Prose selectors must exclude `[data-slot]`.** `docs.sass` styles `p`, `a`, `ul`, `code`
  inside `.doc-article`, and a rendered component sits inside that scope. `<Button href>` is
  an `<a>` and picked up the prose underline until the selector became `a:not([data-slot])`.
  Every new prose rule needs the same exclusion.
- Chrome components live in `src/lib/docs/`: `Preview`, `Examples`, `PropsTable`,
  `CodeBlock`, `Sidebar`, `Toc`.

## Dual distribution

The package is published to npm **and** meant to be copy-pasteable. These conflict: a
component `.sass` that says `+interactive` breaks when the folder is copied alone. A
flattened copy-paste variant (mixins inlined, shared classes resolved) must be generated
from the same source — never maintained by hand.