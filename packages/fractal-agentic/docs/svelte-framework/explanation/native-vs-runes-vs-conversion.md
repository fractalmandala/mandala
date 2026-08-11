---
title: "Native HTML, Svelte runes, and conversion"
description: "Choose the right construction lane for a SvelteKit request."
type: explanation
---

# Native HTML, Svelte runes, and conversion

The framework has three construction lanes.

## Native HTML/CSS

Use this when the platform already provides the behavior: disclosure, dialog, popover,
form controls, progress, or static layout. It has the smallest runtime surface.

## Svelte 5 runes

Use this when the component needs controlled state, derived values, effects, snippets,
or interaction across multiple elements. Keep the public API explicit and typed.

## React/Next conversion

Use the conversion lane when there is source code to preserve. It adds an output contract
because a conversion must explain more than a component: route files, data flow, SSR,
dependencies, fallbacks, and verification.

The lanes can compose. A converted page can contain a Svelte rune component and use a
native `<button>` inside it.
