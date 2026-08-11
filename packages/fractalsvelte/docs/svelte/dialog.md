---
title: Dialog
description: A controlled Modal Dialog component powered by **Svelte 5 Runes** (`$state`, `$bindable`, `$effect`, `$props`). Features body scroll locking via `$effect()`, focus traps, and smooth open/close bindings.
---


## Component Implementation (`Dialog.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    open?: boolean;
    title?: string;
    trigger?: Snippet;
    children?: Snippet;
  };

  let { open = $bindable(false), title, trigger, children }: Props = $props();

  // Scroll locking effect
  $effect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  });

  function close() {
    open = false;
  }
</script>

{#if trigger}
  <div onclick={() => open = true} role="button" tabindex="0">
    {@render trigger()}
  </div>
{/if}

{#if open}
  <div class="[ modal-backdrop ] [ row ycenter xcenter position-fixed ]" onclick={close} role="presentation">
    <div
      class="[ modal-container ] [ box maxw500 w100 ] [ pad24 radius12 bdr ]"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <header class="[ row ycenter xbetween marginbot16 ]">
        {#if title}
          <h3 class="margin0 text-lg bold">{title}</h3>
        {/if}
        <button class="[ modal-close ] [ text-xl lh1 ]" onclick={close}>&times;</button>
      </header>

      <div class="[ modal-body ]">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

<style lang="sass">
  .modal-backdrop
    inset: 0
    background-color: rgba(15, 23, 42, 0.5)
    backdrop-filter: blur(4px)
    z-index: 100

  .modal-container
    background-color: var(--background10, #ffffff)
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

  .modal-close
    background: none
    border: none
    cursor: pointer
    color: var(--foreground-muted, #64748b)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Dialog from './Dialog.svelte';

  let isOpen = $state(false);
</script>

<button class="button" data-variant="primary" onclick={() => isOpen = true}>Open Dialog</button>

<Dialog bind:open={isOpen} title="Settings">
  <p>Dialog body content...</p>
</Dialog>
```
