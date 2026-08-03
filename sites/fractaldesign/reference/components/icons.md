---
title: Icons
description: A small library of file-type icons (Svelte, TypeScript, CSS, Markdown, Terminal, GitHub, MCP) used in the code viewer of the docs site.
---

# Icons

The `Icons` family is a small set of file-type glyphs used by `CodeView` and `CodeTree` to indicate what kind of file is being shown. Each glyph is a square inline SVG colored with `currentColor`.

The styling below is pure indented Sass.

## Tokens

```sass
$color:           currentColor
$icon-size:       1rem          // 16px — `size-4`
$icon-size-sm:    0.875rem      // 14px — `size-3.5`
$transition:      150ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Mixins

```sass
=icon-base
  display: inline-flex
  align-items: center
  justify-content: center
  width: $icon-size
  height: $icon-size
  color: $color
  flex-shrink: 0
  vertical-align: middle

  > svg
    width: 100%
    height: 100%

  // brand-tinted variants
  &--svelte     color: hsl(1 71% 58%)
  &--typescript color: hsl(214 89% 52%)
  &--css        color: hsl(220 79% 56%)
  &--markdown   color: $fg
  &--terminal   color: $fg-muted
  &--github     color: $fg
  &--mcp        color: hsl(280 70% 55%)
```

## All Icons

```sass
.icon-svelte
  +icon-base
  color: hsl(1 71% 58%)

.icon-typescript
  +icon-base
  color: hsl(214 89% 52%)

.icon-css
  +icon-base
  color: hsl(220 79% 56%)

.icon-markdown
  +icon-base
  color: $fg

.icon-terminal
  +icon-base
  color: $fg-muted

.icon-github
  +icon-base
  color: $fg

.icon-mcp
  +icon-base
  color: hsl(280 70% 55%)

.icon-code
  +icon-base
  color: $fg-muted
```

## Size variants

```sass
.icon--sm
  width: $icon-size-sm
  height: $icon-size-sm

.icon--lg
  width: 1.25rem      // 20px
  height: 1.25rem
```

## Hover / active states (when used as links)

```sass
a > .icon-github:hover
  color: $fg-muted

a > .icon-svelte:hover
  filter: brightness(1.1)
```

## Dark mode

The icons already use `currentColor` or fixed brand colors. No dark-mode overrides are required — the brand colors look correct in both modes.

## Usage skeleton (Svelte, for reference)

```svelte
<Svelte class="icon-svelte icon--sm" />

<!-- Or as a static import + className -->
<img class="icon-github" src="/icons/github.svg" alt="" />

<a href="https://github.com/owner/repo">
  <span class="icon-github"></span>
  View source
</a>
```
