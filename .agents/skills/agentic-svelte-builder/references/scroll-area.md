# Scroll Area (Zero-JS Native Component)

The **Scroll Area** component provides custom scrollbars natively using CSS `overflow: auto`, styled with **`fractals-styler`** primitives (`box`, `w100`, `padright4`).

---

## Component Code (`ScrollArea.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    maxHeight?: string;
    children?: Snippet;
  };

  let { maxHeight = '300px', children, style = '', ...restProps }: Props = $props();

  let computedStyle = $derived(`max-height: ${maxHeight}; ${style}`);
</script>

<div class="[ scroll-area ] [ box w100 padright4 ]" style={computedStyle} {...restProps}>
  {@render children?.()}
</div>

<style lang="sass">
  .scroll-area
    overflow-y: auto
    scrollbar-width: thin
    scrollbar-color: var(--border, #cbd5e1) transparent

    &::-webkit-scrollbar
      width: 6px

    &::-webkit-scrollbar-track
      background: transparent

    &::-webkit-scrollbar-thumb
      background-color: var(--border, #cbd5e1)
      border-radius: var(--radiusfull, 9999px)
      &:hover
        background-color: var(--foreground-subtle, #94a3b8)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import ScrollArea from './ScrollArea.svelte';
</script>

<ScrollArea maxHeight="200px">
  <p>Long scrolling content here...</p>
</ScrollArea>
```
