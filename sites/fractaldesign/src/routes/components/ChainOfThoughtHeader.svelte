<script lang="ts">
  let {
    expanded = false,
    onclick,
    class: className = '',
    children,
    ...rest
  }: {
    expanded?: boolean;
    onclick?: (e: MouseEvent) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<button
  class="chain-of-thought-header {className}"
  aria-expanded={expanded}
  type="button"
  {onclick}
  {...rest}
>
  {@render children?.()}
</button>

<style lang="sass">
  .chain-of-thought-header
    display: flex
    width: 100%
    align-items: center
    gap: 0.5rem
    padding: 0
    border: 0
    background: transparent
    font-size: 0.875rem
    color: hsl(215 16% 47%)
    cursor: pointer
    text-align: left
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      color: hsl(222 47% 11%)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px
      border-radius: 0.375rem

    > svg:first-of-type
      width: 1rem
      height: 1rem
      flex-shrink: 0

    > span
      flex: 1 1 auto

    > svg:last-of-type
      width: 1rem
      height: 1rem
      flex-shrink: 0
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1)
      transform: rotate(0deg)

    &[aria-expanded="true"] > svg:last-of-type
      transform: rotate(180deg)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
      &:hover
        color: hsl(210 40% 98%)
</style>
