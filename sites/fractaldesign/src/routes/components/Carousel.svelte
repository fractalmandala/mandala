<script lang="ts">
  let {
    orientation = 'horizontal' as const,
    class: className = '',
    children,
    ...rest
  }: {
    orientation?: 'horizontal' | 'vertical';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="carousel {className}" data-orientation={orientation} {...rest}>
  <div class="carousel-content">
    {@render children?.()}
  </div>
</div>

<style lang="sass">
  .carousel
    position: relative
    width: 100%

    &[data-orientation="vertical"]
      height: 100%

  .carousel-content
    display: flex
    overflow: hidden
    margin: calc(-1 * 0.5rem)

    .carousel[data-orientation="vertical"] &
      flex-direction: column
      height: 100%

  .carousel-item
    flex: 0 0 100%
    min-width: 0
    padding: 0.5rem
    box-sizing: border-box

    .carousel[data-orientation="vertical"] &
      flex: 0 0 auto
      height: 100%
</style>
