---
title: Styling
description: Early styling configs.
---

Headings are prose-styled via Tailwind Typography — h2 is `1.5em` at `.prose h2` (see the built CSS). Font *sizes* aren't a config token, so override with plain CSS in a `theme.css` at the project root (auto-loaded, last cascade layer per the theming docs):

`.prose h2` (specificity 0,1,1) beats the built-in `.prose :where(h2)` (0,1,0) because `:where()` contributes zero. Same pattern for `.prose h3`, `h1`, etc. Font *family* for headings is `--blume-font-display`; sizes are these plain CSS rules.

Created at `sites/fractalhome/theme.css` — the project root of the fractalhome site (where `blume.config.ts` lives), which is where Blume auto-detects it. It's the final cascade layer, so it wins over defaults.

Note: I included a couple of example token overrides (accent, radius, dark background) along with the `.prose h2` size bump — remove those if you only wanted the h2 change.

## Font Setup

Error **because of your manual file**. The fresh isolated build downloaded Google Sans Flex itself:

- `@font-face { font-family: "Google Sans Flex-34b6689504f6a242"; src: url("/_astro/fonts/3aeefb3a1c35c277.woff2") }` — in the page `<head>`
- `--blume-font-display-src` / `--blume-font-body-src` → `var(--blume-ff-google-sans-flex)`

The file you placed at `dist/_astro/fonts/GoogleSansFlex.woff2` is doing nothing and will be **wiped**: `dist/` is generated build output and gitignored (`dist/` in `.gitignore:3`), rewritten on every `blume build`. Don't hand-place fonts there.

`{ name: "Google Sans Flex" }` in config already auto-fetches and self-hosts it. If you ever want a local file instead, put it at a *source* path like `sites/fractalhome/fonts/GoogleSansFlex.woff2` and use the `variants` form — never in `dist/`. You can delete the manual copy.

Note the real `dist/` is stale (still Inter in its CSS — built before the config change); it'll pick up Google Sans Flex on the next non-isolated build.