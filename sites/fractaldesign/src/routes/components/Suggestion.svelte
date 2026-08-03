<script lang="ts">
  let {
    onclick,
    class: className = '',
    children,
    ...rest
  }: {
    onclick?: (e: MouseEvent) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<button class="suggestion {className}" type="button" {onclick} {...rest}>
  {@render children?.()}
</button>

<style lang="sass">
  .suggestion
    display: inline-flex
    align-items: center
    justify-content: center
    height: 2rem
    padding: 0 1rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 9999px
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    font-size: 0.875rem
    font-weight: 500
    cursor: pointer
    white-space: nowrap
    user-select: none
    -webkit-user-select: none
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)
      border-color: hsl(222 47% 11% / 0.2)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px

    @media (prefers-color-scheme: dark)
      border-color: hsl(217 33% 17%)
      background-color: hsl(222 47% 6%)
      color: hsl(210 40% 98%)
      &:hover
        background-color: hsl(217 33% 17%)
        border-color: hsl(217 33% 22%)
</style>
