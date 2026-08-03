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
  class="command-item {className}"
  data-selected={selected ? 'true' : undefined}
  aria-selected={selected ? 'true' : undefined}
  data-disabled={disabled ? 'true' : undefined}
  {...rest}
>
  {@render children?.()}
</div>

<style lang="sass">
  .command-item
    position: relative
    display: flex
    align-items: center
    gap: 0.5rem
    padding: 0.375rem 0.5rem
    border-radius: 0.375rem
    font-size: 0.875rem
    line-height: 1.25
    cursor: default
    user-select: none
    -webkit-user-select: none
    outline: none
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &[data-selected="true"],
    &[aria-selected="true"]
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    &[data-disabled="true"]
      pointer-events: none
      opacity: 0.5

    > svg
      width: 1rem
      height: 1rem
      color: hsl(215 16% 47%)
      flex-shrink: 0
      pointer-events: none

    @media (prefers-color-scheme: dark)
      &[data-selected="true"],
      &[aria-selected="true"]
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
</style>
