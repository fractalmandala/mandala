# Empty State (Zero-JS Native Component)

The **Empty State** component displays a placeholder view for empty lists or search results, styled with **`fractals-styler`** primitives (`box`, `xcenter`, `ycenter`, `pad48`, `pad24`, `radius12`, `text-lg`, `text-sm`, `bold`, `gap8`).

---

## Component Code (`Empty.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    title?: string;
    description?: string;
    icon?: Snippet;
    action?: Snippet;
  };

  let {
    title = 'No data available',
    description = 'There are no items to display at this time.',
    icon,
    action
  }: Props = $props();
</script>

<div class="[ empty ] [ box xcenter ycenter ] [ pad48 pad24-sm radius12 ]">
  {#if icon}
    <div class="[ empty__icon ] [ marginbot16 ]">
      {@render icon()}
    </div>
  {/if}

  <h4 class="[ empty__title ] [ margin0 marginbot8 text-lg bold ]">{title}</h4>
  <p class="[ empty__description ] [ margin0 marginbot24 text-sm maxw360 ]">{description}</p>

  {#if action}
    <div class="[ empty__action ] [ row gap8 ]">
      {@render action()}
    </div>
  {/if}
</div>

<style lang="sass">
  .empty
    text-align: center
    border: 2px dashed var(--border, #e2e8f0)
    background-color: var(--background20, #f8fafc)

    &__icon
      color: var(--foreground-subtle, #94a3b8)

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
  import Empty from './Empty.svelte';
  import Button from './Button.svelte';
</script>

<Empty title="No Projects Found" description="Get started by creating your first project now.">
  {#snippet action()}
    <Button variant="primary">Create Project</Button>
  {/snippet}
</Empty>
```
