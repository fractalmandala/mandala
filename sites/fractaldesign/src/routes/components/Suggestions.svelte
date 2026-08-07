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

<div class="suggestions {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .suggestions
    display: flex
    width: 100%
    overflow-x: auto
    gap: 0.5rem
    scrollbar-width: none

    &::-webkit-scrollbar
      display: none
</style>
