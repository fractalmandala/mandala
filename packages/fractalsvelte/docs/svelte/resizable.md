---
title: Resizable
description: An interactive Resizable split pane layout component powered by **Svelte 5 Runes** (`$state`, `$derived`, `$props`). Tracks pointer drag handles dynamically to recalculate panel size percentages.
---


## Component Implementation (`Resizable.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    initialRatio?: number; // e.g. 50 (%)
    left?: Snippet;
    right?: Snippet;
  };

  let { initialRatio = 50, left, right }: Props = $props();

  let ratio = $state(initialRatio);
  let isDragging = $state(false);
  let containerRef = $state<HTMLDivElement | null>(null);

  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging || !containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
    ratio = Math.max(10, Math.min(90, newRatio));
  }

  function handlePointerUp(e: PointerEvent) {
    isDragging = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }
</script>

<div
  bind:this={containerRef}
  class="[ resizable-container ] [ row w100 h100 position-relative ]"
>
  <div class="[ resizable-panel-left ] [ h100 ]" style="width: {ratio}%;">
    {@render left?.()}
  </div>

  <div
    class="[ resizable-handle ] [ row ycenter xcenter height100 ]"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    role="separator"
    aria-valuenow={ratio}
  >
    <div class="[ resizable-handle__bar ] [ width4 height24 radiusfull ]"></div>
  </div>

  <div class="[ resizable-panel-right ] [ h100 grow ]" style="width: {100 - ratio}%;">
    {@render right?.()}
  </div>
</div>

<style lang="sass">
  .resizable-container
    overflow: hidden

  .resizable-handle
    width: 8px
    cursor: col-resize
    user-select: none
    background-color: var(--border-subtle, #f1f5f9)
    &:hover
      background-color: var(--border, #cbd5e1)

    &__bar
      background-color: var(--foreground-subtle, #94a3b8)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Resizable from './Resizable.svelte';
</script>

<div style="height: 400px;">
  <Resizable initialRatio={30}>
    {#snippet left()}
      <div class="[ pad16 bg-surface h100 ]">Sidebar Panel</div>
    {/snippet}

    {#snippet right()}
      <div class="[ pad16 h100 ]">Main Content Area</div>
    {/snippet}
  </Resizable>
</div>
```
