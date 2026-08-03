<script lang="ts">
  let {
    selected = false,
    disabled = false,
    class: className = '',
    children,
    ...rest
  }: {
    selected?: boolean;
    disabled?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div
  class="select-item {className}"
  data-highlighted={selected ? 'true' : undefined}
  data-state={selected ? 'checked' : 'unchecked'}
  data-disabled={disabled ? 'true' : undefined}
  {...rest}
>
  <span data-slot="select-item-indicator">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  </span>
  <span class="select-item-text">
    {@render children?.()}
  </span>
</div>

<style lang="sass">
  .select-item
    position: relative
    display: flex
    width: 100%
    align-items: center
    gap: 0.375rem
    padding: 0.5rem 1.25rem
    border-radius: 0.375rem
    font-size: 0.875rem
    cursor: default
    user-select: none
    -webkit-user-select: none
    outline: none
    color: hsl(222 47% 11%)
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &[data-highlighted],
    &:focus-visible
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    &[data-state="checked"]
      color: hsl(222 47% 11%)

    &[data-disabled]
      pointer-events: none
      opacity: 0.5

    > [data-slot="select-item-indicator"]
      position: absolute
      left: 0.5rem
      display: inline-flex
      align-items: center
      justify-content: center
      width: 1rem
      height: 1rem
      color: hsl(222 47% 11%)
      > svg
        width: 1rem
        height: 1rem

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
      &[data-highlighted],
      &:focus-visible
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)

  .select-item-text
    flex: 1 1 auto
    font-size: 0.875rem
    white-space: nowrap
    text-overflow: ellipsis
    overflow: hidden
</style>
