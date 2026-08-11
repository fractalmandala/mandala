---
title: "The Svelte Boss contract"
description: "Understand the quality rules applied to generated Svelte and SvelteKit output."
type: explanation
---

# The Svelte Boss contract

The Svelte Boss is the project-level quality authority for Svelte work.

## Core rules

- Svelte 5 runes for new reactive code.
- Native semantic HTML before custom ARIA.
- `onclick`, not legacy `on:` syntax.
- Snippets and `{@render}` instead of new slot-based APIs.
- External indented SASS for custom styling.
- Semantic CSS variables and `data-state`/`data-variant` attributes.
- No component `<style>` blocks in generated recipe/conversion output.
- No inline styles, `class:` directives, or fallback hex palette values.
- No implicit dependency installation or package manifest mutation.
- SSR and browser boundaries are explicit.
- Verification evidence comes from actual files and actual commands.

These rules are intentionally stricter than generic Svelte examples because the framework
is building a repeatable project surface, not a one-off playground.
