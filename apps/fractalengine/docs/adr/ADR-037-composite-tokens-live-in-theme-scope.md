---
id: ADR-037
title: Composite Tokens Must Be Declared in Theme Scope, Not :root
type: adr
tags: [design-tokens, css-variables, theming, sass]
summary: Custom properties substitute their var() references where declared, so composite tokens referencing theme-scoped primitives were guaranteed-invalid at :root; they now live in a shared .theme-amrit-light/.theme-amrit-dark block.
relates_to: [01-tokens, 12-token-theme-mapping]
status: accepted
updated: 2026-07-17
---

# ADR-037: Composite Tokens Must Be Declared in Theme Scope, Not `:root`

## Status

Accepted — 2026-07-17

## Context

`_tokens.sass` declared ~70 composite semantic tokens at `:root` whose values reference
theme-scoped primitives, e.g. `--shadow-tooltip: 0 6px 18px var(--shadow-strong)` and every
`color-mix(...)` surface token. The primitives (`--shadow-strong`, `--theme-color`,
`--background10`, …) are only declared inside `.theme-amrit-light` / `.theme-amrit-dark`,
which the layout applies to `main.app-root-shell`.

Per the CSS Custom Properties spec, a custom property's **computed value substitutes its
`var()` references on the element where the property's value is determined** — here `:root`,
where the primitives do not exist. Each such token therefore computed to the
guaranteed-invalid (empty) value, and that empty value is what every descendant inherited,
*including* elements inside the theme scope. Consequence: every consumer of these tokens
(`box-shadow: var(--shadow-panel)`, `--focus-ring`, danger/success/warning surfaces, tile
and canvas colors, module legend dots, …) silently computed to its initial value app-wide.
Verified at runtime: `getComputedStyle(el).getPropertyValue('--shadow-tooltip')` returned
`""` on every element; the failure was invisible because missing shadows and rings don't
error.

Discovered while building the Bits UI tooltip (the portalled content had no shadow even
after portalling into `.app-root-shell`).

## Decision

- `:root` in `_tokens.sass` keeps only tokens that are self-contained: literals, and
  composites whose `var()` references are themselves declared at `:root` (sizes, type
  scale, transitions, z-indices).
- All composite tokens referencing theme-scoped primitives — directly or transitively —
  move to a single shared block `` .theme-amrit-light, .theme-amrit-dark `` placed after
  both theme blocks. Values stay theme-agnostic; substitution happens on the element that
  carries the theme class, where the primitives resolve per active theme.
- **Rule for new tokens:** a `:root` declaration may only reference variables also declared
  at `:root`. Anything referencing a theme primitive goes in the shared theme block.
  Audit: for each `:root` declaration containing `var()`, check the referenced name is
  declared in the same block.
- New themes must define the primitive set; the shared composite block's selector list must
  be extended with the new theme class.

## Alternatives Considered

- **Define primitives at `:root` with theme overrides.** Rejected: substitution at `:root`
  would freeze composites to the default-theme primitives; theme classes would change the
  primitives but the already-substituted composites would not react.
- **Declare composites on `.app-root-shell`.** Works only because the theme class happens to
  sit on the same element; coupling the token layer to a layout class is more fragile than
  coupling it to the theme classes themselves.
- **Per-consumer fallbacks** (`var(--x, fallback)`). Rejected as systemic policy — it
  duplicates values at every call site; the one interim fallback in `_tooltip.sass` was
  removed as part of this change.

## Consequences

- All composite tokens now resolve and are theme-reactive (verified: values flip when the
  theme class changes; full unit suite and style-contracts pass).
- Visual change by design: shadows, focus rings, and tinted surfaces that were silently
  absent now render. Anything that looks "suddenly shadowed" was always specified to look
  that way.
- Elements portalled outside `.app-root-shell` (e.g. to `document.body`) get neither
  primitives nor composites — portal into the app shell (see the Bits tooltip pattern).
