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

<div class="carousel-item {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .carousel-item
    flex: 0 0 100%
    min-width: 0
    padding: 0.5rem
    box-sizing: border-box

    .carousel[data-orientation="vertical"] &
      flex: 0 0 auto
      height: 100%
</style>
