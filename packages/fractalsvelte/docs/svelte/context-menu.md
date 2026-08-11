---
title: Context Menu
description: A right-click Context Menu component powered by **Svelte 5 Runes** (`$state`, `$effect`, `$props`). Listens for native `contextmenu` events, calculates cursor position, and dismisses on window clicks.
---


## Component Implementation (`ContextMenu.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type MenuItem = {
    label: string;
    action: () => void;
  };

  type Props = {
    items: MenuItem[];
    children?: Snippet;
  };

  let { items, children }: Props = $props();

  let open = $state(false);
  let pos = $state({ x: 0, y: 0 });

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    pos = { x: e.clientX, y: e.clientY };
    open = true;
  }

  // Dismiss menu when clicking outside
  $effect(() => {
    if (!open) return;
    function handleOutsideClick() {
      open = false;
    }
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  });
</script>

<div oncontextmenu={handleContextMenu} class="[ context-menu-trigger ]">
  {@render children?.()}
</div>

{#if open}
  <div
    class="[ context-menu ] [ box pad6 radius8 bdr position-fixed ]"
    style="top: {pos.y}px; left: {pos.x}px;"
    role="menu"
  >
    {#each items as item}
      <button
        class="[ context-menu__item ] [ row ycenter w100 pad8 radius4 text-sm ]"
        onclick={() => { item.action(); open = false; }}
        role="menuitem"
      >
        {item.label}
      </button>
    {/each}
  </div>
{/if}

<style lang="sass">
  .context-menu
    background-color: var(--background10, #ffffff)
    border-color: var(--border, #cbd5e1)
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
    min-width: 160px
    z-index: 100

    &__item
      background: none
      border: none
      cursor: pointer
      color: var(--foreground10, #0f172a)
      text-align: left
      &:hover
        background-color: var(--background20, #f1f5f9)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import ContextMenu from './ContextMenu.svelte';

  const menu = [
    { label: 'Copy Link', action: () => console.log('Copied') },
    { label: 'Inspect Item', action: () => console.log('Inspected') }
  ];
</script>

<ContextMenu items={menu}>
  <div class="[ pad24 bdr radius8 bg-surface ]">
    Right-click inside this area to open the custom menu.
  </div>
</ContextMenu>
```
