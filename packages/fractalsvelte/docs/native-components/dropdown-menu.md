---
title: Dropdown Menu
description: The Dropdown Menu component displays action items inside a contextual popup natively using the Popover API and CSS Anchor Positioning, styled with fractals-styler…
---

## Component Code (`DropdownMenu.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type MenuItem = {
    id: string;
    label: string;
    onclick?: () => void;
  };

  type Props = {
    id: string;
    items: MenuItem[];
    trigger?: Snippet<[menuId: string]>;
  };

  let { id, items, trigger }: Props = $props();
</script>

{#if trigger}
  {@render trigger(id)}
{/if}

<div {id} popover="auto" class="[ dropdown-menu ] [ pad6 radius8 bdr minw180 ]">
  <div class="[ dropdown-menu__list ] [ box gap2 ]" role="menu">
    {#each items as item}
      <button class="[ dropdown-menu__item ] [ row ycenter w100 pad8 padleft12 padright12 radius4 text-sm ]" role="menuitem" onclick={item.onclick}>
        {item.label}
      </button>
    {/each}
  </div>
</div>

<style lang="sass">
  .dropdown-menu
    margin: 0
    background-color: var(--background10, #ffffff)
    border-color: var(--border, #cbd5e1)
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

    /* Native CSS Anchor Positioning */
    position-anchor: --dropdown-anchor
    top: anchor(bottom)
    left: anchor(start)
    margin-top: 0.25rem

    &__item
      color: var(--foreground10, #0f172a)
      background: none
      border: none
      cursor: pointer
      text-align: left
      &:hover
        background-color: var(--background20, #f1f5f9)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import DropdownMenu from './DropdownMenu.svelte';

  const menuItems = [
    { id: '1', label: 'Edit Profile', onclick: () => console.log('Edit') },
    { id: '2', label: 'Log Out', onclick: () => console.log('Logout') }
  ];
</script>

<div style="position: relative; anchor-name: --dropdown-anchor; display: inline-block;">
  <DropdownMenu id="user-menu" items={menuItems}>
    {#snippet trigger(menuId)}
      <button popovertarget={menuId} class="button" data-variant="outline">
        Options &#9662;
      </button>
    {/snippet}
  </DropdownMenu>
</div>
```

