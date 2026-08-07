---
title: Fractalsvelte Svelte Component Library — Coding Conventions
description: - Each component folder follows a fixed layout: a <name.svelte root, sibling part components suffixed with -content, -trigger, -action, etc., a <name.sass stylesheet, and an index.ts barrel that re-e…
tags: [packages/fractalsvelte]
type: card
module: packages/fractalsvelte
path: packages/fractalsvelte
created: 2026-08-05
updated: 2026-08-06
---

- Each component folder follows a fixed layout: a `<name>.svelte` root, sibling part components suffixed with `-content`, `-trigger`, `-action`, etc., a `<name>.sass` stylesheet, and an `index.ts` barrel that re-exports the root component plus typed aliases like `Props`.
- Shared prop vocabulary is centralized in `src/lib/types.ts` (`Radius`, `TextSize`, `TextTransform` and paired with matching Sass mixins (`+radius-variants`, `+text-size-variants`, `+text-transform-variants` so props map one-to-one to style variants without string merging.
- Theme data is single-sourced from `src/lib/themes.json` and consumed through the typed `themes.ts` wrapper, with `toCssVariables()` converting camelCase keys to CSS custom properties (e.g. `sidebarPrimary` → `--sidebar-primary`.
- Documentation pages follow a strict order defined in README.md: title + lede, hero Preview, Installation, Usage, Examples tabbed area, PropsTable, then Theming tokens — all authored as markdown under `src/content/components/<slug>.md`.
- Generated assets are never edited by hand; palette/theme/port files carry a header comment stating they are produced by a script and must be regenerated instead.
