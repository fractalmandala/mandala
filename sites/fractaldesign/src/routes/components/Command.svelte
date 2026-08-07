<script lang="ts">
  let {
    class: className = '',
    children,
    ...rest
  }: {
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="command {className}" {...rest}>
  <div class="command-list">
    {@render children?.()}
  </div>
</div>

<style lang="sass">
  .command
    display: flex
    width: 100%
    height: 100%
    flex-direction: column
    overflow: hidden
    padding: 0.25rem
    border-radius: 0.75rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      color: hsl(210 40% 98%)

  .command-list
    max-height: 18rem
    overflow-x: hidden
    overflow-y: auto
    scroll-padding: 0.25rem
    outline: none

    &::-webkit-scrollbar
      width: 6px
    &::-webkit-scrollbar-thumb
      background-color: hsl(214 32% 91%)
      border-radius: 9999px
</style>
