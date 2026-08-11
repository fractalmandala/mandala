---
title: Skeleton
description: "The Skeleton component displays a loading shimmer effect using pure CSS @keyframes pulse animation, styled with fractals-styler primitives (radius6)."
---

## Component Code (`Skeleton.svelte`)

```svelte
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    width?: string;
    height?: string;
    circle?: boolean;
  };

  let { width = '100%', height = '1rem', circle = false, style = '', ...restProps }: Props = $props();

  let computedStyle = $derived(`width: ${width}; height: ${height}; ${style}`);
</script>

<div
  class="[ skeleton ] [ radius6 ]"
  class:radiusfull={circle}
  style={computedStyle}
  {...restProps}
></div>

<style lang="sass">
  .skeleton
    display: inline-block
    background-color: var(--background20, #e2e8f0)
    animation: skeleton-pulse 1.5s ease-in-out infinite

  @keyframes skeleton-pulse
    0%, 100%
      opacity: 1
    50%
      opacity: 0.4
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Skeleton from './Skeleton.svelte';
</script>

<div style="display: flex; gap: 1rem; align-items: center;">
  <Skeleton circle width="40px" height="40px" />
  <div style="flex: 1;">
    <Skeleton width="60%" height="1rem" />
    <Skeleton width="40%" height="0.75rem" />
  </div>
</div>
```

