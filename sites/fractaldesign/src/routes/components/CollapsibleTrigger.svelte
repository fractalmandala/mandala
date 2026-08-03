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
  class="collapsible-trigger {className}"
  type="button"
  aria-expanded={expanded}
  {onclick}
  {...rest}
>
  {@render children?.()}
</button>

<style lang="sass">
  .collapsible-trigger
    display: inline-flex
    align-items: center
    gap: 0.5rem
    padding: 0
    border: 0
    background: transparent
    color: inherit
    font: inherit
    cursor: pointer
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px
      border-radius: 0.375rem

    > svg:last-of-type
      width: 1rem
      height: 1rem
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1)
      transform: rotate(0deg)

    &[aria-expanded="true"] > svg:last-of-type
      transform: rotate(180deg)
</style>
