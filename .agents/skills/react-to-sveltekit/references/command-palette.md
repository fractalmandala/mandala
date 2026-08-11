# Reference Conversion: Command Palette (React .tsx → Svelte 5 .svelte)

- **Source File**: `vendors/ui-components-main/components/motion/command-palette.tsx`
- **Target Component**: `CommandPalette.svelte`

---

## 1. Converted Svelte 5 Component (`CommandPalette.svelte`)

```svelte
<script lang="ts">
  import { fade, scale } from 'svelte/transition';

  type CommandOption = {
    id: string;
    label: string;
    category?: string;
    action: () => void;
  };

  type Props = {
    open?: boolean;
    options: CommandOption[];
  };

  let { open = $bindable(false), options }: Props = $props();

  let search = $state('');
  let highlightedIndex = $state(0);

  let filtered = $derived(
    options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  );

  function execute(opt: CommandOption) {
    opt.action();
    open = false;
    search = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      highlightedIndex = (highlightedIndex + 1) % (filtered.length || 1);
    } else if (e.key === 'ArrowUp') {
      highlightedIndex = (highlightedIndex - 1 + filtered.length) % (filtered.length || 1);
    } else if (e.key === 'Enter' && filtered[highlightedIndex]) {
      execute(filtered[highlightedIndex]);
    } else if (e.key === 'Escape') {
      open = false;
    }
  }
</script>

{#if open}
  <div class="[ backdrop ] [ row ycenter xcenter position-fixed ]" transition:fade={{ duration: 150 }} onclick={() => open = false} role="presentation">
    <div
      class="[ palette ] [ box maxw500 w100 pad16 radius12 bdr ]"
      transition:scale={{ duration: 150, start: 0.95 }}
      onclick={(e) => e.stopPropagation()}
      onkeydown={handleKeydown}
      role="dialog"
    >
      <input
        type="text"
        bind:value={search}
        placeholder="Type a command or search..."
        class="[ input ] [ w100 pad12 marginbot12 radius6 text-sm ]"
        autofocus
      />

      <div class="[ list ] [ box maxh300 ]" role="listbox">
        {#each filtered as opt, idx (opt.id)}
          <button
            class="[ item ] [ row ycenter xbetween w100 pad10 radius6 text-sm ]"
            class:item--active={idx === highlightedIndex}
            onclick={() => execute(opt)}
            role="option"
            aria-selected={idx === highlightedIndex}
          >
            <span>{opt.label}</span>
            {#if opt.category}
              <span class="[ text-xs color-muted ]">{opt.category}</span>
            {/if}
          </button>
        {:else}
          <div class="[ pad16 text-center text-sm color-muted ]">No commands found</div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style lang="sass">
  .backdrop
    inset: 0
    background-color: rgba(15, 23, 42, 0.5)
    backdrop-filter: blur(4px)
    z-index: 100

  .palette
    background-color: var(--background10, #ffffff)
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

  .list
    overflow-y: auto

  .item
    background: none
    border: none
    cursor: pointer
    color: var(--foreground10, #0f172a)
    text-align: left
    &:hover, &--active
      background-color: var(--background20, #f1f5f9)
</style>
```
