<script lang="ts">
  let {
    ratio = '1 / 1',
    class: className = '',
    children,
    ...rest
  }: {
    ratio?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="aspect-ratio {className}" style="--ratio: {ratio}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .aspect-ratio
    position: relative
    width: 100%
    overflow: hidden
    padding-bottom: calc(100% / (var(--ratio, 1)))
    height: 0

    > *
      position: absolute
      inset: 0
      width: 100%
      height: 100%
      display: block
      object-fit: cover
</style>
