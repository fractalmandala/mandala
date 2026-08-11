---
title: Button
description: The Button component wraps HTML button with fractals-styler primitives (row, ycenter, xcenter, gap8, radius6, text-sm) and CUBE Exception data attributes…
---

## Component Code (`Button.svelte`)

```svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = HTMLButtonAttributes & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  };

  let {
    variant = 'primary',
    size = 'md',
    onclick,
    children,
    ...restProps
  }: Props = $props();
</script>

<button
  class="[ button ] [ row ycenter xcenter gap8 ] [ radius6 text-sm bold ]"
  data-variant={variant}
  data-size={size}
  {onclick}
  {...restProps}
>
  {@render children?.()}
</button>

<style lang="sass">
  .button
    cursor: pointer
    border: 1px solid transparent
    transition: background-color 0.15s ease, border-color 0.15s ease

    &:disabled, &[aria-disabled="true"]
      opacity: 0.5
      cursor: not-allowed

    /* Size Exceptions */
    &[data-size="sm"]
      padding: var(--px4) var(--px10)
      font-size: var(--text-xs, 0.8125rem)

    &[data-size="md"]
      padding: var(--px8) var(--px16)
      font-size: var(--text-sm, 0.875rem)

    &[data-size="lg"]
      padding: var(--px12) var(--px20)
      font-size: var(--text-md, 1rem)

    /* Variant Exceptions */
    &[data-variant="primary"]
      background-color: var(--brand-primary, #2563eb)
      color: #ffffff
      &:hover:not(:disabled)
        background-color: var(--brand-primary-hover, #1d4ed8)

    &[data-variant="secondary"]
      background-color: var(--background20, #f1f5f9)
      color: var(--foreground10, #0f172a)
      &:hover:not(:disabled)
        background-color: var(--background30, #e2e8f0)

    &[data-variant="outline"]
      background-color: transparent
      border-color: var(--border, #cbd5e1)
      color: var(--foreground10, #0f172a)
      &:hover:not(:disabled)
        background-color: var(--background10, #f8fafc)

    &[data-variant="ghost"]
      background-color: transparent
      color: var(--foreground10, #0f172a)
      &:hover:not(:disabled)
        background-color: var(--background20, #f1f5f9)

    &[data-variant="destructive"]
      background-color: var(--danger-bg, #dc2626)
      color: #ffffff
      &:hover:not(:disabled)
        background-color: var(--danger-hover, #b91c1c)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Button from './Button.svelte';

  function handleClick() {
    console.log('Button clicked!');
  }
</script>

<Button variant="primary" onclick={handleClick}>Submit Form</Button>
<Button variant="outline" disabled>Disabled State</Button>
```
