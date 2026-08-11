# Reference Conversion: Bouncy Accordion (React .tsx → Svelte 5 .svelte)

- **Source File**: `vendors/ui-components-main/components/motion/bouncy-accordion.tsx`
- **Target Component**: `BouncyAccordion.svelte`

---

## 1. Converted Svelte 5 Component (`BouncyAccordion.svelte`)

```svelte
<script lang="ts">
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  export type BouncyAccordionItem = {
    id: string;
    title: string;
    description?: string;
    disabled?: boolean;
  };

  type Props = {
    items: BouncyAccordionItem[];
    value?: string | null;
    collapsible?: boolean;
  };

  let { items, value = $bindable(null), collapsible = true }: Props = $props();

  function toggle(id: string) {
    if (value === id && collapsible) {
      value = null;
    } else {
      value = id;
    }
  }
</script>

<div class="[ bouncy-accordion ] [ box w100 gap12 ]">
  {#each items as item (item.id)}
    <div
      class="[ accordion-item ] [ radius12 bdr ]"
      data-state={value === item.id ? 'open' : 'closed'}
    >
      <button
        class="[ trigger ] [ row ycenter xbetween w100 pad16 text-sm bold ]"
        disabled={item.disabled}
        onclick={() => toggle(item.id)}
      >
        <span>{item.title}</span>
        <span class="[ chevron ] [ text-xs ]" class:chevron--rotated={value === item.id}>&#9660;</span>
      </button>

      {#if value === item.id}
        <div
          class="[ content ] [ pad16 padtop0 text-sm color-muted ]"
          transition:slide={{ duration: 250, easing: cubicOut }}
        >
          {item.description}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style lang="sass">
  .accordion-item
    background-color: var(--background10, #ffffff)
    border-color: var(--border, #cbd5e1)
    transition: box-shadow 0.2s ease

  .trigger
    background: none
    border: none
    cursor: pointer
    color: var(--foreground10, #0f172a)

  .chevron
    transition: transform 0.2s ease
    &--rotated
      transform: rotate(180deg)
</style>
```
