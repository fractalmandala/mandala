---
title: Textarea
description: "The Textarea component wraps standard HTML textarea with Svelte 5 state binding (bind:value), styled with fractals-styler primitives (w100, pad10, pad12, radius6, bdr,…"
---

## Component Code (`Textarea.svelte`)

```svelte
<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  type Props = HTMLTextareaAttributes & {
    value?: string;
  };

  let { value = $bindable(''), rows = 4, class: className = '', ...restProps }: Props = $props();
</script>

<textarea
  bind:value={value}
  {rows}
  class="[ textarea ] [ w100 pad10 padleft12 padright12 radius6 bdr text-sm ] {className}"
  {...restProps}
></textarea>

<style lang="sass">
  .textarea
    font-family: inherit
    color: var(--foreground10, #0f172a)
    background-color: var(--background10, #ffffff)
    border-color: var(--border, #cbd5e1)
    resize: vertical
    transition: border-color 0.15s ease, box-shadow 0.15s ease

    &::placeholder
      color: var(--foreground-subtle, #94a3b8)

    &:focus
      outline: none
      border-color: var(--brand-primary, #2563eb)
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Textarea from './Textarea.svelte';

  let bio = $state('');
</script>

<Textarea bind:value={bio} placeholder="Tell us about yourself..." />
```

