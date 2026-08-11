---
title: Dropdown Menu
description: An accessible Dropdown Menu component powered by **Svelte 5 Runes** (`$state`, `$bindable`, `$effect`, `$props`). Features keyboard arrow navigation, active item selection, and click-outside dismissal.
---


## Component Implementation (`DropdownMenu.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type MenuItem = {
    id: string;
    label: string;
    action: () => void;
  };

  type Props = {
    items: MenuItem[];
    trigger?: Snippet;
  };

  let { items, trigger }: Props = $props();

  let open = $state(false);
  let activeIndex = $state(0);

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      activeIndex = (activeIndex + 1) % items.length;
    } else if (e.key === 'ArrowUp') {
      activeIndex = (activeIndex - 1 + items.length) % items.length;
    } else if (e.key === 'Enter') {
      items[activeIndex]?.action();
      open = false;
    } else if (e.key === 'Escape') {
      open = false;
    }
  }

  $effect(() => {
    if (!open) return;
    function handleOutsideClick() { open = false; }
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  });
</script>

<div class="[ dropdown-container ] [ position-relative ]" onkeydown={handleKeydown}>
  <div onclick={(e) => { e.stopPropagation(); open = !open; }} role="button" tabindex="0">
    {@render trigger?.()}
  </div>

  {#if open}
    <div class="[ dropdown-menu ] [ box pad6 radius8 bdr minw180 position-absolute ]" role="menu">
      {#each items as item, idx}
        <button
          class="[ dropdown-menu__item ] [ row ycenter w100 pad8 radius4 text-sm ]"
          class:dropdown-menu__item--active={idx === activeIndex}
          onclick={() => { item.action(); open = false; }}
          role="menuitem"
        >
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style lang="sass">
  .dropdown-menu
    top: 100%
    left: 0
    margin-top: 0.25rem
    background-color: var(--background10, #ffffff)
    border-color: var(--border, #cbd5e1)
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
    z-index: 50

    &__item
      background: none
      border: none
      cursor: pointer
      color: var(--foreground10, #0f172a)
      text-align: left
      &:hover, &--active
        background-color: var(--background20, #f1f5f9)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import DropdownMenu from './DropdownMenu.svelte';

  const menu = [
    { id: '1', label: 'Edit Profile', action: () => console.log('Edit') },
    { id: '2', label: 'Log Out', action: () => console.log('Logout') }
  ];
</script>

<DropdownMenu items={menu}>
  {#snippet trigger()}
    <button class="button" data-variant="outline">Options &#9662;</button>
  {/snippet}
</DropdownMenu>
```
