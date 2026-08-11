---
title: Toggle Group
description: A controlled Toggle Group component supporting single or multi-selection using **Svelte 5 Runes** (`$state`, `$bindable`, `$props`).
---


## Component Implementation (`ToggleGroup.svelte`)

```svelte
<script lang="ts">
  type ToggleOption = {
    value: string;
    label: string;
  };

  type Props = {
    options: ToggleOption[];
    value?: string | string[];
    multiple?: boolean;
  };

  let { options, value = $bindable(multiple ? [] : ''), multiple = false }: Props = $props();

  function isSelected(val: string): boolean {
    return Array.isArray(value) ? value.includes(val) : value === val;
  }

  function toggle(val: string) {
    if (multiple && Array.isArray(value)) {
      if (value.includes(val)) {
        value = value.filter(v => v !== val);
      } else {
        value = [...value, val];
      }
    } else {
      value = val;
    }
  }
</script>

<div class="[ toggle-group ] [ row ycenter pad4 radius8 ]" role="group">
  {#each options as opt}
    <button
      class="[ toggle-group__btn ] [ row ycenter pad6 padleft12 padright12 radius6 text-sm bold ]"
      class:toggle-group__btn--selected={isSelected(opt.value)}
      onclick={() => toggle(opt.value)}
      aria-pressed={isSelected(opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>

<style lang="sass">
  .toggle-group
    background-color: var(--background20, #f1f5f9)

    &__btn
      background: none
      border: none
      cursor: pointer
      color: var(--foreground-muted, #64748b)
      transition: background-color 0.15s ease, color 0.15s ease

      &--selected
        background-color: var(--background10, #ffffff) !important
        color: var(--foreground10, #0f172a) !important
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05)
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import ToggleGroup from './ToggleGroup.svelte';

  let align = $state('left');
  const opts = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ];
</script>

<ToggleGroup options={opts} bind:value={align} />
```
