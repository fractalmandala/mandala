# Toggle (Zero-JS Native Component)

The **Toggle** component styles a checkbox (`<input type="checkbox">`) as a pressable button, styled with **`fractals-styler`** primitives (`row`, `ycenter`, `xcenter`, `pad8`, `radius6`).

---

## Component Code (`Toggle.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    pressed?: boolean;
    children?: Snippet;
  };

  let { pressed = $bindable(false), children }: Props = $props();
</script>

<label class="[ toggle ] [ row ycenter ]">
  <input type="checkbox" bind:checked={pressed} class="[ toggle__input ]" />
  <span class="[ toggle__button ] [ row ycenter xcenter pad8 radius6 ]">
    {@render children?.()}
  </span>
</label>

<style lang="sass">
  .toggle
    cursor: pointer
    user-select: none

    &__input
      position: absolute
      opacity: 0
      width: 0
      height: 0

      &:checked + .toggle__button
        background-color: var(--background30, #e2e8f0)
        color: var(--foreground10, #0f172a)

    &__button
      color: var(--foreground-muted, #64748b)
      background-color: transparent
      transition: background-color 0.15s ease, color 0.15s ease

      &:hover
        background-color: var(--background20, #f1f5f9)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Toggle from './Toggle.svelte';

  let isBold = $state(false);
</script>

<Toggle bind:pressed={isBold}>
  <strong>B</strong>
</Toggle>
```
