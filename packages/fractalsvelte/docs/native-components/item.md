---
title: Item
description: The Item component provides a flexible list/menu row container, styled with fractals-styler primitives (row, ycenter, gap12, pad12, padleft16, padright16, radius6,…
---

## Component Code (`Item.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    title: string;
    description?: string;
    icon?: Snippet;
    trailing?: Snippet;
    onclick?: (e: MouseEvent) => void;
  };

  let { title, description, icon, trailing, onclick, ...restProps }: Props = $props();
</script>

<div
  class="[ item ] [ row ycenter gap12 ] [ pad12 padleft16 padright16 radius6 ]"
  class:item--clickable={!!onclick}
  {onclick}
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
  {...restProps}
>
  {#if icon}
    <div class="[ item__icon ] [ row ycenter ]">
      {@render icon()}
    </div>
  {/if}

  <div class="[ item__content ] [ box grow ]">
    <span class="[ item__title ] [ text-sm bold ]">{title}</span>
    {#if description}
      <span class="[ item__description ] [ text-xs ]">{description}</span>
    {/if}
  </div>

  {#if trailing}
    <div class="[ item__trailing ] [ row ycenter marginleft-auto ]">
      {@render trailing()}
    </div>
  {/if}
</div>

<style lang="sass">
  .item
    background-color: var(--background10, #ffffff)
    transition: background-color 0.15s ease

    &--clickable
      cursor: pointer
      &:hover
        background-color: var(--background20, #f1f5f9)

    &__icon
      color: var(--foreground-muted, #64748b)

    &__title
      color: var(--foreground10, #0f172a)

    &__description
      color: var(--foreground-muted, #64748b)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Item from './Item.svelte';

  function handleSelect() {
    console.log('Item clicked');
  }
</script>

<Item
  title="Security Settings"
  description="Manage password and multi-factor authentication"
  onclick={handleSelect}
/>
```

