---
id: 03-typography
title: Type Scale, Font Families, and Typographic Roles
type: design
tags: [typography, fonts, designer, codegen]
summary: Defines the app type system and the designer's typed whole-block typography adapter with canvas/export parity.
relates_to: [08-font-usage, designer]
updated: 2026-07-16
---

# Typography

**Source:** [_typography.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_typography.sass)

---

## Font Scale Tokens

```
	--text-scaling: 1.2
	--text-xs: 10px
	--text-sm: 12px
	--text-md: 14px
	--text-bs: 1rem
	--text-lg: calc(var(--text-bs) * var(--text-scaling))
	--text-xl: calc(var(--text-lg) * var(--text-scaling))
	--text-2xl: calc(var(--text-xl) * var(--text-scaling))
	--text-3xl: calc(var(--text-2xl) * var(--text-scaling))
	--text-4xl: calc(var(--text-3xl) * var(--text-scaling))
	--text-5xl: calc(var(--text-4xl) * var(--text-scaling))
```

## Font Stacks Used

| Context | Font Stack
|---------|------------|-------------|
| Body / UI | `"Google Sans", sans-serif` |
| Editor (CodeMirror) | `"JetBrains Mono", monospace` |
| Terminal | `"JetBrains Mono", monospace` |
| AI Reasoning | `"JetBrains Mono", monospace` |
| Inline code blocks (AI) | `"JetBrains Mono", monospace` |
| TOTP timer | `"JetBrains Mono", monospace` |

---

**Rule:** Use `.text-xs`/`.text-sm` classes instead of raw `font-size` declarations in Svelte markup whenever possible.

## Designer block typography

The Designer inspector uses a typed `Typography` adapter in `src/lib/modules/designer/engine/typography.ts`. It stores rich text-block semantics in the existing style-record pattern under `_typography`, then mirrors compatible values to CSS declarations. This keeps canvas rendering and code generation equivalent while allowing persisted legacy records with only `font-*`, `text-align`, and related CSS keys to load without migration.

The curated picker exposes Google Sans Flex, Inter, Roboto, common system serif/sans fonts, and monospace families with preview rows. A browser font-availability check gives a local fallback notice when a selected family cannot be loaded. The inspector stylesheet remains token-only: its font picker, notice, and preview list consume semantic colour, size, spacing, radius, and shadow variables.
