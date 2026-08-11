---
title: Switch
description: "The Switch component wraps input with Svelte 5 state binding (bind:checked), styled with fractals-styler primitives (row, ycenter, gap8, radiusfull, text-sm)."
---

## Component Code (`Switch.svelte`)

```svelte
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  type Props = Omit<HTMLInputAttributes, 'type'> & {
    checked?: boolean;
    label?: string;
  };

  let { checked = $bindable(false), label, ...restProps }: Props = $props();
</script>

<label class="[ switch ] [ row ycenter gap8 text-sm ]">
  <input
    type="checkbox"
    role="switch"
    bind:checked={checked}
    class="[ switch__input ]"
    {...restProps}
  />
  <span class="[ switch__track ] [ radiusfull pad2 ]">
    <span class="[ switch__thumb ] [ radiusfull ]"></span>
  </span>
  {#if label}
    <span class="[ switch__label ] [ color-foreground ]">{label}</span>
  {/if}
</label>

<style lang="sass">
  .switch
    cursor: pointer
    user-select: none

    &__input
      position: absolute
      opacity: 0
      width: 0
      height: 0

      &:checked + .switch__track
        background-color: var(--brand-primary, #2563eb)
        .switch__thumb
          transform: translateX(1.25rem)

      &:focus-visible + .switch__track
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25)

    &__track
      position: relative
      display: inline-block
      width: 2.5rem
      height: 1.375rem
      background-color: var(--border, #cbd5e1)
      transition: background-color 0.2s ease

    &__thumb
      display: block
      width: 1.125rem
      height: 1.125rem
      background-color: #ffffff
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2)
      transition: transform 0.2s ease
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Switch from './Switch.svelte';

  let darkMode = $state(false);
</script>

<Switch bind:checked={darkMode} label="Dark Mode" />
```

