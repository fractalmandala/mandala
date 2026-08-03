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

<h5 class="alert-title {className}" {...rest}>
  {@render children?.()}
</h5>

<style lang="sass">
  .alert-title
    grid-column: 2
    margin: 0
    font-weight: 600
    line-height: 1.25
    color: inherit

    &:only-child
      grid-row: span 2
</style>
