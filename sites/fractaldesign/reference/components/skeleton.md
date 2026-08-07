---
title: Skeleton
description: A pulsing placeholder block used while content is loading. The simplest primitive in the library — typically replaced inline once the real content arrives.
---

# Skeleton

The `Skeleton` component is a single `<div>` with a muted background and a subtle pulse animation. It is the foundational placeholder primitive — used inline anywhere the real content is still loading.

The styling below is pure indented Sass.

## Tokens

```sass
$bg-muted: hsl(210 40% 96%)
$animation-duration: 2s
```

## Skeleton

```sass
.skeleton
  display: block
  background-color: $bg-muted
  border-radius: 0.375rem

  // a soft 2-second pulse to indicate loading
  animation: skeleton-pulse $animation-duration cubic-bezier(0.4, 0, 0.6, 1) infinite

@keyframes skeleton-pulse
  0%, 100%
    opacity: 1
  50%
    opacity: 0.5
```

## Reduced motion

```sass
@media (prefers-reduced-motion: reduce)
  .skeleton
    animation: none
    opacity: 0.7
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-muted-dark: hsl(217 33% 17%)

  .skeleton
    background-color: $bg-muted-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="skeleton" style="height: 1rem; width: 75%;"></div>
<div class="skeleton" style="height: 1rem; width: 100%;"></div>
<div class="skeleton" style="height: 6rem; width: 100%;"></div>
```
