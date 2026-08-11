# Avatar (Zero-JS Native Component)

The **Avatar** component displays user images or initial fallbacks, styled with **`fractals-styler`** primitives (`row`, `xcenter`, `ycenter`, `radiusfull`, `text-sm`, `bold`). Sizes use CUBE `data-size` attributes.

---

## Component Code (`Avatar.svelte`)

```svelte
<script lang="ts">
  type Props = {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg';
  };

  let { src, alt = 'Avatar', fallback = 'U', size = 'md' }: Props = $props();
</script>

<div
  class="[ avatar ] [ row xcenter ycenter ] [ radiusfull ]"
  data-size={size}
>
  {#if src}
    <img {src} {alt} class="[ avatar__img ] [ w100 h100 radiusfull ]" />
  {:else}
    <span class="[ avatar__fallback ] [ bold ]">{fallback}</span>
  {/if}
</div>

<style lang="sass">
  .avatar
    position: relative
    overflow: hidden
    background-color: var(--background20, #e2e8f0)
    color: var(--foreground-muted, #475569)
    user-select: none

    &__img
      object-fit: cover

    &__fallback
      text-transform: uppercase

    /* CUBE Exception variants via data-size attribute */
    &[data-size="sm"]
      width: var(--px32, 32px)
      height: var(--px32, 32px)
      font-size: var(--text-xs, 0.75rem)

    &[data-size="md"]
      width: var(--px40, 40px)
      height: var(--px40, 40px)
      font-size: var(--text-sm, 0.875rem)

    &[data-size="lg"]
      width: var(--px56, 56px)
      height: var(--px56, 56px)
      font-size: var(--text-lg, 1.125rem)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Avatar from './Avatar.svelte';
</script>

<Avatar src="https://i.pravatar.cc/150?img=3" alt="John Doe" size="lg" />
<Avatar fallback="JD" size="md" />
```
