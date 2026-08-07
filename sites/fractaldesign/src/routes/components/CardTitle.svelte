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

<h3 class="card-title {className}" {...rest}>
  {@render children?.()}
</h3>

<style lang="sass">
  .card-title
    grid-column: 1
    margin: 0
    font-size: 1rem
    font-weight: 600
    line-height: 1.25
    letter-spacing: -0.01em
    color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
</style>
